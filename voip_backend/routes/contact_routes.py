from flask import Blueprint, request, jsonify
from models import db, Contact, Organization, Status, CallingList, CallLog
from datetime import datetime

# Create a Flask blueprint for grouping contact-related routes
contact_bp = Blueprint("contact_bp", __name__)

# --------------------------------------------------------------------
# GET /contacts - Fetch all contacts
# --------------------------------------------------------------------
@contact_bp.route("/contacts", methods=["GET"])
def get_contacts():
    # Retrieve all contacts from the database
    contacts = Contact.query.all()

    # Convert contact objects into JSON-friendly dictionaries
    results = [
        {
            "id": c.id,
            "first_name": c.first_name,
            "last_name": c.last_name,
            "email": c.email,
            "phone": c.phone,
            "organization": c.organization.name if c.organization else None,
            "status": c.status.label if c.status else None,
            "calling_list": c.calling_list.name if c.calling_list else None,
        }
        for c in contacts
    ]
    return jsonify(results)

# --------------------------------------------------------------------
# POST /contacts - Create a new contact
# --------------------------------------------------------------------
@contact_bp.route("/contacts", methods=["POST"])
def create_contact():
    data = request.get_json()

    # Create a new Contact object with submitted data
    new_contact = Contact(
        first_name=data["first_name"],
        last_name=data["last_name"],
        phone=data.get("phone"),
        email=data.get("email"),
        job_title=data.get("job_title"),
        organization_id=data.get("organization_id"),
        status_id=data.get("status_id"),
        calling_list_id=data.get("calling_list_id"),
        notes=data.get("notes"),
        website=data.get("website"),
        call_time=datetime.strptime(data["call_time"], "%Y-%m-%d %H:%M") if data.get("call_time") else None
    )

    db.session.add(new_contact)  # Add to session
    db.session.commit()         # Commit to DB
    return jsonify({"message": "Contact created!"}), 201

# --------------------------------------------------------------------
# PATCH /contacts/<id> - Update a contact
# --------------------------------------------------------------------
@contact_bp.route("/contacts/<int:id>", methods=["PATCH"])
def update_contact(id):
    contact = Contact.query.get(id)
    if not contact:
        return jsonify({"message": "Contact not found"}), 404

    # Update fields if provided, otherwise keep existing values
    data = request.get_json()
    contact.first_name = data.get("first_name", contact.first_name)
    contact.last_name = data.get("last_name", contact.last_name)
    contact.email = data.get("email", contact.email)
    contact.phone = data.get("phone", contact.phone)
    contact.job_title = data.get("job_title", contact.job_title)
    contact.organization_id = data.get("organization_id", contact.organization_id)
    contact.status_id = data.get("status_id", contact.status_id)
    contact.calling_list_id = data.get("calling_list_id", contact.calling_list_id)
    contact.notes = data.get("notes", contact.notes)
    contact.website = data.get("website", contact.website)

    db.session.commit()
    return jsonify({"message": "Contact updated!"})

# --------------------------------------------------------------------
# DELETE /contacts/<id> - Delete a single contact
# --------------------------------------------------------------------
@contact_bp.route("/contacts/<int:id>", methods=["DELETE"])
def delete_contact(id):
    contact = Contact.query.get(id)
    if not contact:
        return jsonify({"message": "Contact not found"}), 404

    db.session.delete(contact)
    db.session.commit()
    return jsonify({"message": "Contact deleted!"})

# --------------------------------------------------------------------
# POST /contacts/bulk-delete - Delete multiple contacts at once
# --------------------------------------------------------------------
@contact_bp.route("/contacts/bulk-delete", methods=["POST"])
def bulk_delete_contacts():
    data = request.get_json()
    ids = data.get("ids", [])

    if not ids:
        return jsonify({"message": "No IDs provided"}), 400

    try:
        # Delete all contacts whose ID is in the provided list
        Contact.query.filter(Contact.id.in_(ids)).delete(synchronize_session=False)
        db.session.commit()
        return jsonify({"message": f"{len(ids)} contacts deleted!"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error: {str(e)}"}), 500

# --------------------------------------------------------------------
# POST /call-log - Add an interaction to the call log
# --------------------------------------------------------------------
@contact_bp.route("/call-log", methods=["POST"])
def add_call_log():
    data = request.get_json()

    new_log = CallLog(
        contact_id=data["contact_id"],
        activity=data["activity"],
        timestamp=datetime.strptime(data["timestamp"], "%Y-%m-%d %H:%M")
    )

    db.session.add(new_log)
    db.session.commit()
    return jsonify({"message": "Call log added!"}), 201
