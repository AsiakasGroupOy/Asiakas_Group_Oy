from flask import Blueprint, request, jsonify, current_app,g
from extensions import db
from models.models import User, Invitation, UserRoles, TwilioAgentStatus
from schemas.user_schemas import UserLogInSchema, UserRegisterSchema, UserRoleSchema 
import jwt, hashlib
from helpers.helpers import auth_required, create_access_token, create_refresh_token
from datetime import datetime, timezone
import logging
from helpers.validations import is_valid_password


user_bp = Blueprint('user_bp', __name__)

user_logIn_schema = UserLogInSchema()
user_reg_schema = UserRegisterSchema()
user_roles_schema = UserRoleSchema(many=True)

security_logger = logging.getLogger("security")
audit_logger = logging.getLogger("audit")
app_logger = logging.getLogger("app")

# ✅ User List

@user_bp.route('/all', methods=['GET'])
@auth_required
def get_all_users():
    if g.role not in ["Admin Access", "App Admin"]:
        security_logger.error("Unauthorized access: user_id=%s, customer_id=%s method=%s path=%s ip=%s", g.user_id, g.customer_id, request.method, request.path, request.remote_addr)
        return jsonify({"error": "Forbidden"}), 403


    users = User.query.filter(User.customer_id == g.customer_id, User.user_id !=1).all()
    return jsonify(user_roles_schema.dump(users)), 200

# ✅ User Registration

@user_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    token = data.get("token")
    username = data.get("username")
    password = data.get("password", "").strip()
    

    if not token or not username or not password:
        app_logger.warning("Registration attempt with missing fields: ip=%s path=%s", request.remote_addr, request.path)
        return jsonify({"error": "Username, and password are required."}), 400

    password_valid= is_valid_password(password)
    if not password_valid["valid"]:
        app_logger.warning("Registration attempt with invalid password: username=%s ip=%s path=%s", username, request.remote_addr, request.path)
        return jsonify({"error": "\n".join(password_valid["errors"])}), 400
    
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    invitation = Invitation.query.filter_by(token_hash=token_hash, used=False, revoked=False).first()

    db_time_toCompare= invitation.expires_at
    if db_time_toCompare.tzinfo is None:
        db_time_toCompare = db_time_toCompare.replace(tzinfo=timezone.utc)

    if not invitation or db_time_toCompare < datetime.now(timezone.utc):
        app_logger.warning("Invalid or expired registration link attempt: ip=%s path=%s", request.remote_addr, request.path)
        return jsonify({"error": "Invalid or expired link"}), 400
    existing_user = User.query.filter_by(useremail=invitation.invitation_email, username=username).first()
    if existing_user:
        app_logger.warning("Registration attempt with existing user: username=%s email=%s ip=%s path=%s", username, invitation.invitation_email, request.remote_addr, request.path)
        return jsonify({"error": "This User already exists."}), 400

    user = User(
        username=username,
        useremail=invitation.invitation_email,
        role=invitation.role,
        customer_id=invitation.customer_id
    )
    user.set_password(password)
    invitation.used = True

    db.session.add(invitation)
    db.session.add(user)
    db.session.commit()

    twilio_agent= TwilioAgentStatus(
        user_id=user.user_id,
        available_since=None,
        customer_id=invitation.customer_id
    )

    db.session.add(twilio_agent)
    db.session.commit()

    audit_logger.info("New User REGISTERED: user_id=%s customer_id=%s", user.user_id, user.customer_id)

    return jsonify({"message": "Registration successful"}), 201

# ✅ User Role change
@user_bp.route('/role', methods=['PUT'])
@auth_required
def assign_user_role():
    if g.role not in ["Admin Access", "App Admin"]:
        security_logger.error("Unauthorized access to role assignment: user_id=%s, customer_id=%s method=%s path=%s ip=%s", g.user_id, g.customer_id, request.method, request.path, request.remote_addr)
        return jsonify({"error": "Forbidden"}), 403
    
    data = request.get_json()
        
    if not data.get('useremail') or not data.get('role'): # Check for all required fields data.get('useremail')
        app_logger.warning("Role assignment attempt with missing fields: user_id=%s, customer_id=%s method=%s path=%s ip=%s", g.user_id, g.customer_id, request.method, request.path, request.remote_addr)
        return jsonify({"error": "Useremail and role are required."}), 400
    if g.role=="App Admin":
        customer_id = data.get('customer_id')
        user = User.query.filter_by(useremail=data['useremail'], customer_id=customer_id).first() 
    if g.role=="Admin Access":
        user = User.query.filter_by(useremail=data['useremail'], customer_id=g.customer_id).first() # For assignment and further use after verification useremail can be get as data['useremail']
    if not user:
        app_logger.warning("Role assignment attempt for non-existing user: by user_id=%s, customer_id=%s method=%s path=%s ip=%s", g.user_id, g.customer_id, request.method, request.path, request.remote_addr)
        return jsonify({"error": "User not found."}), 404

    role = data['role']
    if role :
        role = UserRoles(role)

    user.role = role    

    db.session.commit()
    audit_logger.info("User ROLE CHANGED: user_id=%s, new_role=%s by user_id=%s customer_id=%s", user.user_id, user.role.value, g.user_id, g.customer_id)
    return jsonify({"message": f"Role '{data['role']}' assigned to {user.username}."}), 200

# DELETE user
@user_bp.route('/remove', methods=['POST'])
@auth_required
def delete_user():
    if g.role not in ["Admin Access", "App Admin"]:
        security_logger.error("Unauthorized attempt to delete user: user_id=%s, customer_id=%s method=%s path=%s ip=%s", g.user_id, g.customer_id, request.method, request.path, request.remote_addr)
        return jsonify({"error": "Forbidden"}), 403

    userId= request.get_json()
    
    if not userId.get('user_id'): 
        app_logger.warning("User deletion attempt with missing user_id: by user_id=%s, customer_id=%s method=%s path=%s ip=%s", g.user_id, g.customer_id, request.method, request.path, request.remote_addr)
        return jsonify({"error": "User data required."}), 400

    user_id = userId.get('user_id')
    user = User.query.get(user_id)
    if not user:
        app_logger.warning("User deletion attempt for non-existing user: user_id=%s by user_id=%s, customer_id=%s method=%s path=%s ip=%s", user_id, g.user_id, g.customer_id, request.method, request.path, request.remote_addr)   
        return jsonify({"error": "User not found."}), 404

    db.session.delete(user)
    db.session.commit()

    audit_logger.info("User DELETED: user_id=%s, useremail=%s by user_id=%s", user.user_id, user.useremail, g.user_id)

    return jsonify({"message": f"User with Email {user.useremail} deleted successfully"}), 200


# ✅ User Log In
@user_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    useremail = data.get("useremail").strip()
    password = data.get("password").strip()
   
    current_user = User.query.filter_by(useremail=useremail).first()
    if not current_user or not current_user.check_password(password):
        security_logger.warning("Failed login attempt: useremail=%s ip=%s path=%s", useremail, request.remote_addr, request.path)
        return jsonify({"error": "Invalid password or user email"}), 401

    access_token = create_access_token(current_user)
    refresh_token = create_refresh_token(current_user)

    twilio_agent = TwilioAgentStatus.query.filter_by(user_id=current_user.user_id).first()
    if twilio_agent:
        twilio_agent.status = 'online'
        twilio_agent.available_since = datetime.now(timezone.utc)
        db.session.commit()
   
    resp = jsonify({
            "user_id": current_user.user_id,
            "customer_id": current_user.customer_id,
            "role": current_user.role.value  
         })

#⚠️ on product secure is True (HTTPS) /  samesite="Strict" insted of "Lax"

    resp.set_cookie("access_token", access_token, httponly=True, secure=True, samesite="Strict", max_age=int(current_app.config['ACCESS_EXPIRES'].total_seconds()))  # 15 min
    resp.set_cookie("refresh_token", refresh_token, httponly=True, secure=True, samesite="Strict", max_age=int(current_app.config['REFRESH_EXPIRES'].total_seconds()))  # 1 day

    audit_logger.info("User LOGGED IN: user_id=%s, customer_id=%s", current_user.user_id, current_user.customer_id)
    return resp, 200



# ✅ Current User
@user_bp.route("/current")
@auth_required
def currentUser():
    # g.user_id, g.role, g.customer_id come from access token
    return jsonify({
        "user_id": g.user_id,
        "customer_id": g.customer_id,
        "role": g.role  # this is authoritative
    }),200


# ✅ User Log Out
@user_bp.route("/logout", methods=["POST"])
def logout():
    data= request.get_json()
    user_id= data.get("user_id")

    twilio_agent = TwilioAgentStatus.query.filter_by(user_id=user_id).first()
    if twilio_agent:
        twilio_agent.status = 'offline'
        db.session.commit()

    resp = jsonify({"message": "Logged out",
                    })
    #⚠️ on product secure is True (HTTPS) /  samesite="Strict" insted of "Lax"
    resp.set_cookie("access_token", "", expires=0, path="/", httponly=True, secure=True, samesite="Strict")
    resp.set_cookie("refresh_token", "", expires=0, path="/", httponly=True, secure=True, samesite="Strict")

    audit_logger.info("User LOGGED OUT: user_id=%s", user_id)
    return resp


# ✅ User Token Refresh
@user_bp.route("/refresh", methods=["POST"])
def refresh():
    token = request.cookies.get("refresh_token")
    if not token:
        security_logger.warning("Refresh token missing: ip=%s", request.remote_addr)
        return jsonify({"error": "Unauthorized"}), 401
    try:
        data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
        if data.get("type") != "refresh":
            security_logger.warning("Invalid token type during token refresh attempt: ip=%s", request.remote_addr)
            return jsonify({"error": "Unauthorized"}), 401
    except jwt.ExpiredSignatureError:
        security_logger.info("Refresh token expired: user_id=%s, customer_id=%s", data.get("user_id"),  data.get("customer_id"))    
        return jsonify({"error": "Refresh token expired"}), 401
    except jwt.InvalidTokenError as e:
        security_logger.error("Invalid refresh token: ip=%s", request.remote_addr)
        return jsonify({"error": "Invalid refresh token"}), 401
   
#⚠️ on product secure is True (HTTPS) /  samesite="Strict" insted of "Lax"
    new_access = create_access_token(payload=data)
    resp = jsonify({"message": "token refreshed"})
    resp.set_cookie("access_token", new_access, httponly=True, secure=True,
                    samesite="Strict", max_age=int(current_app.config['ACCESS_EXPIRES'].total_seconds()))
    
    return resp,200