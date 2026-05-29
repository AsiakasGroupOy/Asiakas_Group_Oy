from calendar import c
from flask import Blueprint, request, jsonify, g
from extensions import db
from models.models import Customer, User
from schemas.customers_schemas import CustomersSchema, CustomersShortSchema
from schemas.user_schemas import UserRoleSchema
from helpers.helpers import auth_required
import logging
from helpers.validations import validate_phone

customer_bp = Blueprint('customer_bp', __name__)
customers_schema = CustomersSchema(many=True)
customer_short_schema = CustomersShortSchema(many=True)
user_role_schema = UserRoleSchema(many=True)
security_logger = logging.getLogger("security")
audit_logger = logging.getLogger("audit")

# ✅ Get All Customers without default
@customer_bp.route('/all', methods=['GET'])
@auth_required
def get_all_customers():
    if not g.role == "App Admin":
            security_logger.error("Unauthorized access to fetch customers list attempt by user: user_id=%s, customer_id=%s method=%s path=%s ip=%s",  g.user_id,  g.customer_id, request.method, request.path, request.remote_addr )
            return jsonify({"error": "Forbidden"}), 403
    customers = Customer.query.filter(Customer.customer_id != 1).all()
    return jsonify(customers_schema.dump(customers)), 200


# ✅ Get All Customers for options list
@customer_bp.route('/options', methods=['GET'])
@auth_required
def get_customers_options():
    if not g.role == "App Admin":
            security_logger.error("Unauthorized access to fetch customers options list attempt by user: user_id=%s, customer_id=%s method=%s path=%s ip=%s",  g.user_id,  g.customer_id, request.method, request.path, request.remote_addr)
            return jsonify({"error": "Forbidden"}), 403
    customers = Customer.query.all()
    return jsonify(customer_short_schema.dump(customers)), 200


# ✅ Get Users for a Customer
@customer_bp.route('/<int:customer_id>/users', methods=['GET'])
@auth_required
def get_users_for_customer(customer_id):
    if not g.role == "App Admin":
        security_logger.error("Unauthorized access to customer's users list attempt by user: user_id=%s, customer_id=%s method=%s path=%s ip=%s",  g.user_id,  g.customer_id, request.method, request.path, request.remote_addr)
        return jsonify({"error": "Forbidden"}), 403

    users = User.query.filter_by(customer_id=customer_id).all()
    return jsonify(user_role_schema.dump(users)), 200

# ✅ Delete Customer
@customer_bp.route('/remove', methods=['POST'])
@auth_required
def delete_customer():
    if not g.role == "App Admin":
        security_logger.error("Unauthorized delete customer attempt by user: user_id=%s, customer_id=%s method=%s path=%s ip=%s", g.user_id,  g.customer_id, request.method, request.path, request.remote_addr)
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json()
    customer_id = data.get("customer_id")

    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({"error": "errRemoveCustomer"}), 404

    db.session.delete(customer)
    db.session.commit()

    audit_logger.info("Customer DELETED: customer_id=%s customer_name=%s by user_id=%s", customer.customer_id, customer.customer_name, g.user_id)

    return jsonify(customer.customer_name), 200

# ✅ Update Customer 
@customer_bp.route('/<int:customer_id>', methods=['PUT'])
@auth_required
def update_customer(customer_id):
    if not g.role == "App Admin":
        security_logger.error("Unauthorized update customer attempt by user: user_id=%s, customer_id=%s method=%s path=%s ip=%s", g.user_id,  g.customer_id, request.method, request.path, request.remote_addr)
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json()
    
    customer_name = data.get("customer_name").strip()
    customer_address = data.get("customer_address").strip()
    assigned_number = data.get("assigned_number")
    assigned_number = assigned_number.strip() if assigned_number else None
    if assigned_number:
        assigned_number = validate_phone(assigned_number)
        if not assigned_number:
            return jsonify({"error": "errUpdatePhoneValidation"}), 400
  
        
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({"error": "errUpdateCustomerNotFound"}), 404
    if not customer_name or not customer_address :
        return jsonify({"error":["errFieldsRequired"]}), 400

    customer.customer_name = customer_name
    customer.customer_address = customer_address
    customer.assigned_number = assigned_number
    db.session.commit()
    
    audit_logger.info("Customer UPDATED: customer_id=%s customer_name=%s by user_id=%s", customer.customer_id, customer.customer_name, g.user_id)

    return jsonify(customer.customer_name), 200