from flask import Blueprint, jsonify, g,current_app, request
from models.models import User, Customer
from schemas.invitation_schemas import InvitationSchema, InvitationCustomersSchema 
from helpers.helpers import auth_required
from helpers.validations import is_valid_email
import logging
from services.invitation_service import InvitationService

invitation_bp = Blueprint('invitation_bp', __name__)
invitation_schema = InvitationSchema(many=True)
invitation_customers_schema = InvitationCustomersSchema(many=True)

security_logger = logging.getLogger("security")
audit_logger = logging.getLogger("audit")
app_logger = logging.getLogger("app")

# ✅ Invitation Customers List
@invitation_bp.route('/customers', methods=['GET'])
@auth_required
def get_customers_invitations():
    if g.role not in ["App Admin"]:
        security_logger.error("Unauthorized attempt to get list of invitations: user_id=%s, customer_id=%s method=%s path=%s ip=%s", g.user_id,  g.customer_id, request.method, request.path, request.remote_addr)
        return jsonify({"error": "Forbidden"}), 403
    
    invitations = InvitationService.get_invitations_created_by(g.user_id)
    return jsonify(invitation_customers_schema.dump(invitations)), 200

#✅ Invitation to create customer and its admin user
@invitation_bp.route('/customers/invite', methods=['POST'])
@auth_required
def invite_new_customer_user():
    if g.role not in ["App Admin"]:
        security_logger.error("Unauthorized attempt to invite new customer's user: user_id=%s, customer_id=%s method=%s path=%s ip=%s", g.user_id,  g.customer_id, request.method, request.path, request.remote_addr)
        return jsonify({"error": "Forbidden"}), 403
    
    data = request.get_json()
           
    invitation_email = data.get("invitation_email", "").strip()
    if not invitation_email or not is_valid_email(invitation_email):
        return jsonify({"error": "errInvitationsInvalidEmail"}), 400
    if User.query.filter_by(useremail=invitation_email).first():
        app_logger.info("Attempt to invite user by existing email: invitation_email=%s, invited_by_user_id=%s", invitation_email, g.user_id)
        return jsonify({"error": "errInvitationsUserExists"}), 400
    
    customer_name = data.get("customer_name")
    if not customer_name:
        return jsonify({"error": "errInvitationsNoCustomerName"}), 400
    
    customer_address = data.get("customer_address") 
    if not customer_address:
        return jsonify({"error": "errInvitationsNoCustomerAddress"}), 400
    
    if Customer.query.filter_by(customer_name=customer_name, customer_address=customer_address).first():
        app_logger.info("Attempt to create customer with existing name: customer_name=%s, invited_by_user_id=%s", customer_name, g.user_id)
        return jsonify({"error": "errInvitationsCustomerExists"}), 400
    
    customer = InvitationService.create_customer(customer_name, customer_address)
           
    role = "Admin Access"
    token,invitation = InvitationService.create_invitation(customer.customer_id, invitation_email, role, g.user_id)
  

    invitation_link = f"{current_app.config['FRONTEND_URL']}/register?token={token}"
    InvitationService.send_invitation_email(invitation_email, role, invitation_link)

    audit_logger.info("Invitation sent to new customer admin user: invitation_email=%s, invited_by_user_id=%s, customer_id=%s", invitation_email, g.user_id, customer.customer_id)

    return jsonify({"message": invitation_email}), 200

# ✅ DELETE Invitation for customer and its admin user
@invitation_bp.route('/customers/remove', methods=['POST'])
@auth_required
def delete_customer_invitation():
    if g.role not in ["App Admin"]:
        security_logger.error("Unauthorized attempt to remove customer invitation by user: user_id=%s, customer_id=%s method=%s path=%s ip=%s", g.user_id,  g.customer_id, request.method, request.path, request.remote_addr)
        return jsonify({"error": "Forbidden"}), 403

    invId= request.get_json()
    if not invId.get('invitation_id'): 
        app_logger.warning("No invitation ID provided for deletion by user: user_id=%s, customer_id=%s method=%s path=%s ip=%s", g.user_id,  g.customer_id, request.method, request.path, request.remote_addr)
        return jsonify({"error": "errInvitationsRemoveNoIdSend."}), 400
    
    result,status = InvitationService.delete_customer_invitation(invId['invitation_id'])
    if result["status"] == "error":
        app_logger.warning("Error deleting invitation ID %s by user: user_id=%s, customer_id=%s method=%s path=%s ip=%s", invId['invitation_id'], g.user_id,  g.customer_id, request.method, request.path, request.remote_addr)
        return jsonify({"error": result["message"]}), status
    
    audit_logger.info("Customer invitation DELETED: invitation_email=%s, deleted_by_user_id=%s", result['invitation'], g.user_id)

    return jsonify({"message": result['invitation']}), 200


# ✅ Invitation Users List
@invitation_bp.route('/users', methods=['GET'])
@auth_required
def get_users_invitations():
    if g.role not in ["Admin Access" , "App Admin"]:
        security_logger.error("Unauthorized attempt to get list of invitations: user_id=%s, customer_id=%s method=%s path=%s ip=%s", g.user_id,  g.customer_id, request.method, request.path, request.remote_addr)
        return jsonify({"error": "Forbidden"}), 403
    
    invitations = InvitationService.get_users_invitations(g.customer_id)

    return jsonify(invitation_schema.dump(invitations)), 200

#✅ Invitation to user
@invitation_bp.route('/users/invite', methods=['POST'])
@auth_required
def invite_user():
    if g.role not in ["Admin Access" , "App Admin"]:
        security_logger.error("Unauthorized attempt to invite new customer's user: user_id=%s, customer_id=%s method=%s path=%s ip=%s", g.user_id,  g.customer_id, request.method, request.path, request.remote_addr)
        return jsonify({"error": "Forbidden"}), 403
    
    data = request.get_json()
    
    if not data.get("invitation_email") or not data.get("role"):
        app_logger.warning("Invitation data incomplete: invited_by_user_id=%s, customer_id=%s", g.user_id, g.customer_id)
        return jsonify({"error": "errSentInvitationsEmailRoleRequired"}), 400
    
    role = data.get("role")
  
    invitation_email = data.get("invitation_email").strip()
    if not is_valid_email(invitation_email):
        app_logger.warning("Invalid email address provided for invitation: invitation_email=%s, invited_by_user_id=%s, customer_id=%s", invitation_email, g.user_id, g.customer_id)
        return jsonify({"error": "errInvitationsInvalidEmail"}), 400
    
    # Get customer_id from cookie token
    customer_id = g.customer_id   
    if User.query.filter_by(useremail=invitation_email).first():
        app_logger.info("Attempt to invite user by existing email: invitation_email=%s, invited_by_user_id=%s", invitation_email, g.user_id)
        return jsonify({"error": "errInvitationsUserExists"}), 400

    token,invitation = InvitationService.create_invitation(customer_id, invitation_email, role, g.user_id)
  

    invitation_link = f"{current_app.config['FRONTEND_URL']}/register?token={token}"
    InvitationService.send_invitation_email(invitation_email, role, invitation_link)

    audit_logger.info("Invitation sent to user: invitation_email=%s, invited_by_user_id=%s, customer_id=%s", invitation_email, g.user_id, customer_id)

    return jsonify({"message": invitation_email}), 200


# ✅ DELETE Invitation for user
@invitation_bp.route('/users/remove', methods=['POST'])
@auth_required
def delete_user_invitation():
    if g.role not in ["Admin Access", "App Admin"]:
        security_logger.error("Unauthorized attempt to remove user invitation by: user_id=%s, customer_id=%s method=%s path=%s ip=%s", g.user_id,  g.customer_id, request.method, request.path, request.remote_addr)
        return jsonify({"error": "Forbidden"}), 403

    invId= request.get_json()
    if not invId.get('invitation_id'): 
        app_logger.warning("No invitation ID provided for deletion by user: user_id=%s, customer_id=%s method=%s path=%s ip=%s", g.user_id,  g.customer_id, request.method, request.path, request.remote_addr)
        return jsonify({"error": "errInvitationsRemoveNoIdSend"}), 400
    
    result,status = InvitationService.delete_invitation(invId['invitation_id'])
    if result["status"] == "error":
        app_logger.warning("Error deleting invitation ID %s by user: user_id=%s, customer_id=%s method=%s path=%s ip=%s", invId['invitation_id'], g.user_id,  g.customer_id, request.method, request.path, request.remote_addr)
        return jsonify({"error": result["message"]}), status

    audit_logger.info("User invitation DELETED: invitation_email=%s, deleted_by_user_id=%s customer_id=%s", result['invitation'], g.user_id, g.customer_id)

    return jsonify({"message": result['invitation']}), 200



