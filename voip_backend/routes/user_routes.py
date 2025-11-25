from flask import Blueprint, request, jsonify, current_app,g
from extensions import db
from models.models import User, Invitation, UserRoles
from schemas.user_schemas import UserLogInSchema, UserRegisterSchema, UserRoleSchema 
import jwt, hashlib
from helpers.helpers import auth_required, create_access_token, create_refresh_token
from datetime import datetime
import logging
from helpers.validations import is_valid_password

user_bp = Blueprint('user_bp', __name__)

user_logIn_schema = UserLogInSchema()
user_reg_schema = UserRegisterSchema()
user_roles_schema = UserRoleSchema(many=True)

security_logger = logging.getLogger("security")

# ✅ User List

@user_bp.route('/all', methods=['GET'])
@auth_required
def get_all_users():
    if g.role not in ["Admin Access", "App Admin"]:
        security_logger.error("Unauthorized access attempt by user: user_id=%s, customer_id=%s", g.get("user_id"),  g.get("customer_id"))
        return jsonify({"error": "Forbidden"}), 403
    
    
    users = User.query.filter_by(customer_id = g.customer_id).all()
    return jsonify(user_roles_schema.dump(users)), 200

# ✅ User Registration

@user_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    token = data.get("token")
    username = data.get("username")
    password = data.get("password", "").strip()
    

    if not token or not username or not password:
        return jsonify({"error": "Token, username, and password are required."}), 400

    password_valid= is_valid_password(password)
    if not password_valid["valid"]:
        return jsonify({"error": "\n".join(password_valid["errors"])}), 400
    
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    invitation = Invitation.query.filter_by(token_hash=token_hash, used=False, revoked=False).first()

    if not invitation or invitation.expires_at < datetime.now():
        return jsonify({"error": "Invalid or expired link"}), 400

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

    return jsonify({"message": "Registration successful"}), 201

# ✅ User Role change
@user_bp.route('/role', methods=['PUT'])
@auth_required
def assign_user_role():
    if g.role not in ["Admin Access", "App Admin"]:
        security_logger.error("Unauthorized access attempt by user: user_id=%s, customer_id=%s", g.get("user_id"),  g.get("customer_id"))
        return jsonify({"error": "Forbidden"}), 403
    
    data = request.get_json()
    
    if not data.get('username') or not data.get('useremail') or not data.get('role'): # Check for all required fields data.get('useremail')
        return jsonify({"error": "Username, useremail, and role are required."}), 400
    
    user = User.query.filter_by(useremail=data['useremail'], customer_id=g.customer_id).first() # For assignment and further use after verification useremail can be get as data['useremail']
    if not user:
        return jsonify({"error": "User not found."}), 404

    role = data['role']
    if role :
        role = UserRoles(role)

    user.role = role    

    db.session.commit()

    return jsonify({"message": f"Role '{data['role']}' assigned to {user.username}."}), 200

# DELETE user
@user_bp.route('/remove', methods=['POST'])
@auth_required
def delete_user():
    if g.role not in ["Admin Access", "App Admin"]:
        security_logger.error("Unauthorized access attempt by user: user_id=%s, customer_id=%s", g.get("user_id"),  g.get("customer_id"))
        return jsonify({"error": "Forbidden"}), 403

    userId= request.get_json()
    if not userId.get('user_id'): 
        return jsonify({"error": "User data required."}), 400

    user_id = userId.get('user_id')
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": f"User with Email {user.useremail} deleted successfully"}), 200


# ✅ User Log In
@user_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    usermail = data.get("useremail").strip()
    password = data.get("password").strip()
   
    current_user = User.query.filter_by(useremail=usermail).first()

    if not current_user or not current_user.check_password(password):
        return jsonify({"error": "Invalid password or user email"}), 401

    access_token = create_access_token(current_user)
    refresh_token = create_refresh_token(current_user)
   
    resp = jsonify({
            "user_id": current_user.user_id,
            "customer_id": current_user.customer_id,
            "role": current_user.role.value  # this is authoritative
         })

#⚠️ on product secure is True (HTTPS) /  samesite="Strict"

    resp.set_cookie("access_token", access_token, httponly=True, secure=False, samesite="Lax", max_age=int(current_app.config['ACCESS_EXPIRES'].total_seconds()))  # 15 min
    resp.set_cookie("refresh_token", refresh_token, httponly=True, secure=False, samesite="Lax", max_age=int(current_app.config['REFRESH_EXPIRES'].total_seconds()))  # 7 days
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
    resp = jsonify({"message": "Logged out"})
    resp.set_cookie("access_token", "", expires=0)
    resp.set_cookie("refresh_token", "", expires=0)
    return resp


# ✅ User Token Refresh
@user_bp.route("/refresh", methods=["POST"])
def refresh():
    token = request.cookies.get("refresh_token")
    if not token:
        security_logger.warning("Refresh token missing during token refresh attempt: user_id=%s, customer_id=%s", g.get("user_id"),  g.get("customer_id"))
        return jsonify({"error": "Unauthorized"}), 401
    try:
        data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
        if data.get("type") != "refresh":
            security_logger.warning("Invalid token type during token refresh attempt: user_id=%s, customer_id=%s", g.get("user_id"),  g.get("customer_id"))
            return jsonify({"error": "Unauthorized"}), 401
    except jwt.ExpiredSignatureError:
        security_logger.info("Refresh token expired: user_id=%s, customer_id=%s", g.get("user_id"),  g.get("customer_id"))    
        return jsonify({"error": "Refresh token expired"}), 401
    except jwt.InvalidTokenError as e:
        security_logger.error("Invalid refresh token: user_id=%s, customer_id=%s", g.get("user_id"),  g.get("customer_id"))
        return jsonify({"error": "Invalid refresh token"}), 401
    except Exception as e:
        security_logger.error("Unexpected error during token refresh:%s, user_id=%s, customer_id=%s", {str(e)},  g.get("user_id"),  g.get("customer_id"))
        return jsonify({"error": "Internal server error"}), 500

#⚠️ on product secure is True (HTTPS) / samesite="Strict"  
    new_access = create_access_token(payload=data)
    resp = jsonify({"message": "token refreshed"})
    resp.set_cookie("access_token", new_access, httponly=True, secure=False,
                    samesite="Lax", max_age=int(current_app.config['ACCESS_EXPIRES'].total_seconds()))
    
    return resp,200