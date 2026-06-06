from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify,g
from extensions import db
from models.models import TwilioCall
from schemas.callbacks_schemas import CallBacksSchema
from helpers.helpers import auth_required
import logging

callbacks_bp = Blueprint('callbacks_bp', __name__)
callbacks_schema = CallBacksSchema(many=True)
security_logger = logging.getLogger("security")
app_logger = logging.getLogger("app")

# GET calls history for a specific customer
@callbacks_bp.route('/calls', methods=['GET'])
@auth_required
def get_calls_history():
    if g.role not in ["App Admin", "Admin Access" , "Manager",]:
        security_logger.error("Unauthorized access to customer's users list attempt by user: user_id=%s, customer_id=%s method=%s path=%s ip=%s",  g.user_id,  g.customer_id, request.method, request.path, request.remote_addr)
        return jsonify({"error": "Forbidden"}), 403
    
    # App Admin can specify any customer_id, others get their own
    if g.role == "App Admin":
            customer_id = request.args.get("customer_id", type=int)
            if not customer_id:
                app_logger.warning("Missing customer_id in calls history request by App Admin: user_id=%s,customer_id=%s method=%s path=%s ip=%s",g.user_id, customer_id, request.method, request.path, request.remote_addr)
                return jsonify({"error": "errCustomerIdMissing"}), 400
            cutoff = datetime.now() - timedelta(weeks=5)
    else:
            customer_id = g.customer_id
            if not customer_id:
                app_logger.warning("Customer ID not found in session for calls history request: user_id=%s method=%s path=%s ip=%s", g.user_id, request.method, request.path, request.remote_addr)
                return jsonify({"error": "errCustomerIdMissing"}), 400
            cutoff = datetime.now() - timedelta(weeks=2)

    calls = (TwilioCall.query
             .filter_by(customer_id=customer_id)
             .filter(TwilioCall.started_at >= cutoff)
             .order_by(TwilioCall.started_at.desc())).all()
    return jsonify(callbacks_schema.dump(calls)), 200

