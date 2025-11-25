from calendar import c
from flask import Blueprint, request, jsonify, g
from extensions import db
from models.models import Customer, User
from schemas.customers_schemas import CustomersSchema
from schemas.user_schemas import UserRoleSchema
from helpers.helpers import auth_required
import logging
from helpers.validations import validate_phone

customer_bp = Blueprint('customer_bp', __name__)
customers_schema = CustomersSchema(many=True)
user_role_schema = UserRoleSchema(many=True)
security_logger = logging.getLogger("security")

# ✅ Get All Customers
@customer_bp.route('/all', methods=['GET'])
@auth_required
def get_all_customers():
    if not g.role == "App Admin":
            security_logger.error("Unauthorized access to fetch customers list attempt by user: user_id=%s, customer_id=%s", g.get("user_id"),  g.get("customer_id"))
            return jsonify({"error": "Forbidden"}), 403
    customers = Customer.query.all()
    return jsonify(customers_schema.dump(customers)), 200

# ✅ Get Users for a Customer
@customer_bp.route('/<int:customer_id>/users', methods=['GET'])
@auth_required
def get_users_for_customer(customer_id):
    if not g.role == "App Admin":
        security_logger.error("Unauthorized access to customer's users list attempt by user: user_id=%s, customer_id=%s",  g.get("user_id"),  g.get("customer_id"))
        return jsonify({"error": "Forbidden"}), 403

    users = User.query.filter_by(customer_id=customer_id).all()
    return jsonify(user_role_schema.dump(users)), 200

# ✅ Delete Customer
@customer_bp.route('/delete', methods=['POST'])
@auth_required
def delete_customer():
    if not g.role == "App Admin":
        security_logger.error("Unauthorized delete customer attempt by user: user_id=%s, customer_id=%s", g.get("user_id"),  g.get("customer_id"))
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json()
    customer_id = data.get("customer_id")

    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    db.session.delete(customer)
    db.session.commit()

    return jsonify({"message": f"Customer {customer.name} and all related data deleted successfully"}), 200

# ✅ Update Customer 
@customer_bp.route('/<int:customer_id>', methods=['PUT'])
@auth_required
def update_customer(customer_id):
    if not g.role == "App Admin":
        security_logger.error("Unauthorized update customer attempt by user: user_id=%s, customer_id=%s", g.get("user_id"),  g.get("customer_id"))
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json()
    customer_name = data.get("customer_name").strip()
    customer_address = data.get("customer_address").strip()
    assigned_number = data.get("assigned_number")
    assigned_number = assigned_number.strip() if assigned_number else None
    if assigned_number:
        assigned_number = validate_phone(assigned_number)
        if not assigned_number:
            return jsonify({"error": "Phone number is required and must contain only digits with an optional '+' at the start, 6 to 15 digits long."}), 400
  
        
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    customer.customer_name = customer_name
    customer.customer_address = customer_address
    customer.assigned_number = assigned_number
    db.session.commit()

    return jsonify({"message": f"Customer {customer.customer_name} updated successfully"}), 200