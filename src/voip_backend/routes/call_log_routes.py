from flask import Blueprint, request, jsonify
from src.voip_backend.extensions import db
from src.voip_backend.models.models import CallLog, ContactList, Status
from src.voip_backend.schemas.call_log_schemas import CallLogSchema
from marshmallow import ValidationError
from datetime import datetime

calllog_bp = Blueprint('calllog_bp', __name__, url_prefix='/api/calllogs')

calllog_schema = CallLogSchema()
calllogs_schema = CallLogSchema(many=True)

# GET all call logs (no pagination)
@calllog_bp.route('/all', methods=['GET'])
def get_all_call_logs():
    call_logs = CallLog.query.all()
    return jsonify(calllogs_schema.dump(call_logs)), 200

# GET call logs with pagination
@calllog_bp.route('/', methods=['GET'])
def get_call_logs():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    pagination = CallLog.query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page,
        "per_page": pagination.per_page,
        "call_logs": calllogs_schema.dump(pagination.items)
    }), 200

# GET a single call log by ID
@calllog_bp.route('/<int:call_id>', methods=['GET'])
def get_call_log(call_id):
    call_log = CallLog.query.get(call_id)
    if not call_log:
        return jsonify({"error": "Call log not found"}), 404
    return calllog_schema.dump(call_log), 200

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

    status = Status.query.get(data['status_id'])
    if not status:
        return jsonify({"error": "Status not found"}), 404

    new_log = CallLog(**data)
    db.session.add(new_log)
    db.session.commit()

    return calllog_schema.dump(new_log), 201

# UPDATE an existing call log
@calllog_bp.route('/<int:call_id>', methods=['PUT'])
def update_call_log(call_id):
    call_log = CallLog.query.get(call_id)
    if not call_log:
        return jsonify({"error": "Call log not found"}), 404

    try:
        data = calllog_schema.load(request.json, partial=True)
    except ValidationError as err:
        return jsonify(err.messages), 400

    for key, value in data.items():
        setattr(call_log, key, value)

    db.session.commit()
    return calllog_schema.dump(call_log), 200

# DELETE a single call log
@calllog_bp.route('/<int:call_id>', methods=['DELETE'])
def delete_call_log(call_id):
    call_log = CallLog.query.get(call_id)
    if not call_log:
        return jsonify({"error": "Call log not found"}), 404

    db.session.delete(call_log)
    db.session.commit()
    return jsonify({"message": f"Call log with ID {call_id} deleted successfully"}), 200

# BULK DELETE call logs
@calllog_bp.route('/bulk-delete', methods=['DELETE'])
def bulk_delete_call_logs():
    try:
        data = request.get_json(force=True)
        ids = data.get('ids')

        if not ids or not isinstance(ids, list):
            return jsonify({"error": "Please provide a list of call log IDs"}), 400

        call_logs = CallLog.query.filter(CallLog.call_id.in_(ids)).all()
        if not call_logs:
            return jsonify({"error": "No matching call logs found"}), 404

        for log in call_logs:
            db.session.delete(log)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": f"{len(call_logs)} call logs deleted successfully",
            "deleted_ids": [log.call_id for log in call_logs]
        }), 200

    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


