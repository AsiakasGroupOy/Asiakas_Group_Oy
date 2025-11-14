from flask import Blueprint, request, jsonify,g
from extensions import db
from models.models import CallLog, ContactCallingList, CallStatus
from schemas.call_log_schemas import CallLogSchema
from helpers.helpers import auth_required

calllog_bp = Blueprint('calllog_bp', __name__, url_prefix='/api/calllogs')

calllog_schema = CallLogSchema()
calllogs_schema = CallLogSchema(many=True)


# CREATE a new call log
@calllog_bp.route('/<int:concal_id>/status', methods=['POST'])

def create_call_log(concal_id):
    
    data = request.get_json()
    status = data.get('status')

    if status:
         status = CallStatus(status)
        
    concal = ContactCallingList.query.get(concal_id) #Return row if exists, else None
    if not concal:
        return jsonify({"error": "Contact information is not found"}), 404

    new_log = CallLog (
        concal_id=concal_id,
        status=status,
    )
    db.session.add(new_log)
    db.session.commit()

    return calllog_schema.dump(new_log), 201


# DELETE a single call log
@calllog_bp.route('/<int:call_id>', methods=['DELETE'])
@auth_required
def delete_call_log(call_id):
    call_log = CallLog.query.get(call_id)
    if not call_log:
        return jsonify({"error": "Call log not found"}), 404

    db.session.delete(call_log)
    db.session.commit()
    return jsonify({"message": f"Call log with ID {call_id} deleted successfully"}), 200

