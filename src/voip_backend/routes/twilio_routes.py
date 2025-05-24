
print("✅ twilio_routes.py loaded")

from flask import Blueprint, request, jsonify
from src.voip_backend.models.models import CallLog, ContactList
from src.voip_backend.extensions import db
from datetime import datetime


twilio_bp = Blueprint('twilio_bp', __name__)

@twilio_bp.route('/make-call', methods=['POST'])
def mock_twilio_call():
    data = request.get_json()
    contact_id = data.get('contact_id')
    note = data.get('note', 'Mock call initiated from /make-call.')

    # ✅ Validate contact
    contact = ContactList.query.get(contact_id)
    if not contact:
        return jsonify({"error": "Contact not found"}), 404

    # ✅ Create a mock call log entry
    call_log = CallLog(
        contact_id=contact_id,
        status_id=None,
        call_timestamp=datetime.utcnow(),
        call_notes=note
    )

    db.session.add(call_log)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": f"Mock call logged for contact {contact_id}",
        "call_id": call_log.call_id
    }), 200
