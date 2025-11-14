from flask import Blueprint, jsonify, g,current_app, request
from flask_mail import Message
from extensions import db, mail
from models.models import Invitation, User, UserRoles
from schemas.invitation_schemas import InvitationSchema 
from helpers.helpers import auth_required, is_valid_email 
import uuid, hashlib, os
import logging
from datetime import datetime, timedelta

invitation_bp = Blueprint('invitation_bp', __name__)

invitation_schema = InvitationSchema(many=True)

logger = logging.getLogger(__name__)
security_logger = logging.getLogger("security")

# ✅ Invitation List
@invitation_bp.route('/', methods=['GET'])
@auth_required
def get_all_invitations():
    if g.role != "Admin Access":
        security_logger.error("Unauthorized access attempt by user to get list of invitations: user_id=%s, customer_id=%s", g.get("user_id"),  g.get("customer_id"))
        return jsonify({"error": "Forbidden"}), 403
    invitation = Invitation.query.filter_by(customer_id = g.customer_id).all()
    activeUsers = User.query.filter_by(customer_id = g.customer_id).all()
    # Delete invitations for emails that are already registered users
    for inv in invitation:
                if any(user.useremail == inv.invitation_email for user in activeUsers):                      
                    db.session.delete(inv)
                    db.session.commit()
                    logger.info("Deleted invitation for email %s as user already registered.", inv.invitation_email)

    return jsonify(invitation_schema.dump(invitation)), 200

#✅ Invitation to user
@invitation_bp.route('/invite', methods=['POST'])
@auth_required
def invite_user():
    if g.role != "Admin Access":
        security_logger.error("Unauthorized access attempt by user: user_id=%s, customer_id=%s", g.get("user_id"),  g.get("customer_id"))
        return jsonify({"error": "Forbidden"}), 403
    
    customer_id = g.customer_id               # Get customer_id from cookie token

    data = request.get_json()
    
    if not data.get("invitation_email") or not data.get("role"):
        return jsonify({"error": "Role and email are required."}), 400
    
    invitation_email = data.get("invitation_email").strip()
    
    if not is_valid_email(invitation_email):
        return jsonify({"error": "Invalid email address."}), 400
    
    if User.query.filter_by(useremail=invitation_email, customer_id = g.customer_id).first():
        return jsonify({"error": "User with this email already exists."}), 400

    # Get email and role from request body
    
    providedRole = data.get("role")
    if providedRole :
        role = UserRoles(providedRole)
    
    token = str(uuid.uuid4())
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    expires_at = datetime.now() + timedelta(days=1)  # Token valid for 1 day

    invitation = Invitation(
        customer_id = customer_id,
        invitation_email=invitation_email,
        token_hash=token_hash,
        role=role,
        expires_at=expires_at
    )
    db.session.add(invitation)
    db.session.commit()

    invitation_link = f"{current_app.config['FRONTEND_URL']}/register?token={token}"
    print(f"[DEBUG] Invitation link: {invitation_link}")
   
    subject = "You're invited to join our Call Management Application"
    body = f"""
    Hello,

    You have been invited to join the system with the following details:

    Customer Email: {invitation_email}
    Role: {providedRole}
    Invitation link (valid for 24h):
    {invitation_link}

    Please click the link to complete your registration.

    Best regards,
    The Support Team
    """
    msg = Message(subject=subject, recipients=[invitation_email], body=body)
    mail.send(msg)

    return jsonify({"message": f"Invitation sent to '{invitation_email}'"}), 200

    # Here It would send an invitation email with a registration link
     # return jsonify({"message": f"Invitation sent to {data['useremail']}"}), 200

# ✅ DELETE Invitation
@invitation_bp.route('/remove', methods=['POST'])
@auth_required
def delete_invitation():
    if g.role != "Admin Access":
        security_logger.error("Unauthorized access attempt by user: user_id=%s, customer_id=%s", g.get("user_id"),  g.get("customer_id"))
        return jsonify({"error": "Forbidden"}), 403

    invId= request.get_json()
    if not invId.get('invitation_id'): 
        return jsonify({"error": "Invitation data required."}), 400

    invitation = Invitation.query.get(invId['invitation_id'])
    if not invitation:
        return jsonify({"error": "Invitation not found."}), 404

    db.session.delete(invitation)
    db.session.commit()
    return jsonify({"message": f"Invitation for user with Email {invitation.invitation_email} deleted successfully"}), 200


