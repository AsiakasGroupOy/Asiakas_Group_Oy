from flask import Blueprint, request, jsonify
from extensions import db
from models.models import CallLog, ContactList, Status
from datetime import datetime

# Create Blueprint
calllog_bp = Blueprint('calllog_bp', __name__)

# 📌 Helper function to validate datetime format
def is_valid_datetime(date_str):
    try:
        datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
        return True
    except ValueError:
        return False

# ✅ NEW: GET all call logs (without pagination)
@calllog_bp.route('/all', methods=['GET'])
def get_all_call_logs():
    call_logs = CallLog.query.all()
    result = [log.serialize() for log in call_logs]
    return jsonify(result), 200

# 📌 GET all call logs with pagination
@calllog_bp.route('/', methods=['GET'])
def get_call_logs():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    pagination = CallLog.query.paginate(page=page, per_page=per_page, error_out=False)
    call_logs = [log.serialize() for log in pagination.items]

    return jsonify({
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page,
        "per_page": pagination.per_page,
        "call_logs": call_logs
    }), 200

# 📌 GET a single call log by ID
@calllog_bp.route('/<int:call_id>', methods=['GET'])
def get_call_log(call_id):
    call_log = CallLog.query.get(call_id)
    if call_log:
        return jsonify(call_log.serialize()), 200
    return jsonify({"error": "Call log not found"}), 404

# 📌 CREATE a new call log
@calllog_bp.route('/', methods=['POST'])
def create_call_log():
    data = request.get_json()

    contact_id = data.get('contact_id')
    status_id = data.get('status_id')
    call_timestamp = data.get('call_timestamp')
    call_notes = data.get('call_notes')

    if not contact_id:
        return jsonify({"error": "Contact ID is required"}), 400

    if call_timestamp and not is_valid_datetime(call_timestamp):
        return jsonify({"error": "Invalid call_timestamp format. Use YYYY-MM-DD HH:MM:SS"}), 400

    contact = ContactList.query.get(contact_id)
    if not contact:
        return jsonify({"error": "Contact not found"}), 404

    if status_id:
        status = Status.query.get(status_id)
        if not status:
            return jsonify({"error": "Status not found"}), 404

    new_log = CallLog(
        contact_id=contact_id,
        status_id=status_id,
        call_timestamp=datetime.strptime(call_timestamp, "%Y-%m-%d %H:%M:%S") if call_timestamp else datetime.utcnow(),
        call_notes=call_notes
    )
    db.session.add(new_log)
    db.session.commit()

    return jsonify(new_log.serialize()), 201

# 📌 UPDATE a call log
@calllog_bp.route('/<int:call_id>', methods=['PUT'])
def update_call_log(call_id):
    call_log = CallLog.query.get(call_id)
    if not call_log:
        return jsonify({"error": "Call log not found"}), 404

    data = request.get_json()

    call_timestamp = data.get('call_timestamp')
    if call_timestamp and not is_valid_datetime(call_timestamp):
        return jsonify({"error": "Invalid call_timestamp format. Use YYYY-MM-DD HH:MM:SS"}), 400

    call_log.call_timestamp = datetime.strptime(call_timestamp, "%Y-%m-%d %H:%M:%S") if call_timestamp else call_log.call_timestamp
    call_log.call_notes = data.get('call_notes', call_log.call_notes)
    call_log.status_id = data.get('status_id', call_log.status_id)

    db.session.commit()

    return jsonify(call_log.serialize()), 200

# 📌 DELETE a call log
@calllog_bp.route('/<int:call_id>', methods=['DELETE'])
def delete_call_log(call_id):
    call_log = CallLog.query.get(call_id)
    if not call_log:
        return jsonify({"error": "Call log not found"}), 404

    db.session.delete(call_log)
    db.session.commit()

    return jsonify({"message": f"Call log with ID {call_id} deleted successfully"}), 200

# 📌 BULK DELETE call logs
@calllog_bp.route('/bulk-delete', methods=['DELETE'])
def bulk_delete_call_logs():
    try:
        # 🔐 Parse JSON body even in DELETE requests
        data = request.get_json(force=True)
        ids = data.get('ids')

        # ✅ Validate IDs
        if not ids or not isinstance(ids, list):
            return jsonify({"error": "Please provide a list of call log IDs"}), 400

        # 🔍 Query matching call logs
        call_logs = CallLog.query.filter(CallLog.call_id.in_(ids)).all()
        if not call_logs:
            return jsonify({"error": "No matching call logs found"}), 404

        # ❌ Perform bulk delete
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

