from flask import Blueprint, request, jsonify
from extensions import db
from models.models import CallLog, ContactList
from schemas.call_log_schemas import CallLogSchema
from marshmallow import ValidationError
from datetime import datetime

calllog_bp = Blueprint('calllog_bp', __name__, url_prefix='/api/calllogs')

calllog_schema = CallLogSchema()
calllogs_schema = CallLogSchema(many=True)


# CREATE a new call log
@calllog_bp.route('/', methods=['POST'])
def create_call_log():
    try:
        data = calllog_schema.load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400

    contact = ContactList.query.get(data['contact_id'])
    if not contact:
        return jsonify({"error": "Contact not found"}), 404

    new_log = CallLog(**data)
    db.session.add(new_log)
    db.session.commit()

    return calllog_schema.dump(new_log), 201


# DELETE a single call log
@calllog_bp.route('/<int:call_id>', methods=['DELETE'])
def delete_call_log(call_id):
    call_log = CallLog.query.get(call_id)
    if not call_log:
        return jsonify({"error": "Call log not found"}), 404

    db.session.delete(call_log)
    db.session.commit()
    return jsonify({"message": f"Call log with ID {call_id} deleted successfully"}), 200

