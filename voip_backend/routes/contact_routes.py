from flask import Blueprint, request, jsonify
from extensions import db
from models.models import ContactList, Organization, CallingList
from schemas.contact_schemas import ContactSchema
import re

contact_bp = Blueprint('contact_bp', __name__)
contact_schema = ContactSchema()
contacts_schema = ContactSchema(many=True)

# 📌 Helper: Validate email format
def is_valid_email(email):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None

# ✅ GET all contacts (non-paginated)
@contact_bp.route('/all', methods=['GET'])
def get_all_contacts():
    contacts = ContactList.query.all()
    return jsonify(contacts_schema.dump(contacts)), 200

# ✅ GET contacts with pagination
@contact_bp.route('/', methods=['GET'])
def get_contacts():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    pagination = ContactList.query.paginate(page=page, per_page=per_page, error_out=False)
    contacts = pagination.items

    return jsonify({
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page,
        "per_page": pagination.per_page,
        "contacts": contacts_schema.dump(contacts)
    }), 200

# ✅ GET a single contact by ID
@contact_bp.route('/<int:contact_id>', methods=['GET'])
def get_contact(contact_id):
    contact = ContactList.query.get(contact_id)
    if contact:
        return jsonify(contact_schema.dump(contact)), 200
    return jsonify({"error": "Contact not found"}), 404

# ✅ CREATE a new contact
@contact_bp.route('/', methods=['POST'])
def create_contact():
    data = request.get_json()

    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')

    if not first_name or not last_name:
        return jsonify({"error": "First name and Last name are required"}), 400

    if email:
        if not is_valid_email(email):
            return jsonify({"error": "Invalid email format"}), 400
        if ContactList.query.filter_by(email=email).first():
            return jsonify({"error": "Email already exists"}), 400

    if 'phone' in data and ContactList.query.filter_by(phone=data['phone']).first():
        return jsonify({"error": "Phone number already exists"}), 400

    # Organization
    organization = None
    organization_name = data.get('organization_name')
    if organization_name:
        organization = Organization.query.filter_by(organization_name=organization_name).first()
        if not organization:
            organization = Organization(organization_name=organization_name)
            db.session.add(organization)
            db.session.commit()

    # Calling List
    calling_list_id = data.get('calling_list_id')
    if calling_list_id and not CallingList.query.get(calling_list_id):
        return jsonify({"error": "Calling List not found"}), 404

    new_contact = ContactList(
        first_name=first_name,
        last_name=last_name,
        job_title=data.get('job_title'),
        phone=data.get('phone'),
        email=email,
        note=data.get('note'),
        organization_id=organization.organization_id if organization else None,
        calling_list_id=calling_list_id
    )

    db.session.add(new_contact)
    db.session.commit()

    return jsonify(contact_schema.dump(new_contact)), 201

# ✅ UPDATE a contact
@contact_bp.route('/<int:contact_id>', methods=['PUT'])
def update_contact(contact_id):
    contact = ContactList.query.get(contact_id)
    if not contact:
        return jsonify({"error": "Contact not found"}), 404

    data = request.get_json()

    new_email = data.get('email')
    if new_email and new_email != contact.email:
        if not is_valid_email(new_email):
            return jsonify({"error": "Invalid email format"}), 400
        if ContactList.query.filter_by(email=new_email).first():
            return jsonify({"error": "Email already exists"}), 400
        contact.email = new_email

    # Organization
    organization_name = data.get('organization_name')
    if organization_name:
        organization = Organization.query.filter_by(organization_name=organization_name).first()
        if not organization:
            organization = Organization(organization_name=organization_name)
            db.session.add(organization)
            db.session.commit()
        contact.organization_id = organization.organization_id

    # Calling List
    calling_list_id = data.get('calling_list_id')
    if calling_list_id:
        if not CallingList.query.get(calling_list_id):
            return jsonify({"error": "Calling List not found"}), 404
        contact.calling_list_id = calling_list_id

    # Basic fields
    contact.first_name = data.get('first_name', contact.first_name)
    contact.last_name = data.get('last_name', contact.last_name)
    contact.job_title = data.get('job_title', contact.job_title)
    contact.phone = data.get('phone', contact.phone)
    contact.note = data.get('note', contact.note)

    db.session.commit()
    return jsonify(contact_schema.dump(contact)), 200

# ✅ DELETE a contact
@contact_bp.route('/<int:contact_id>', methods=['DELETE'])
def delete_contact(contact_id):
    contact = ContactList.query.get(contact_id)
    if not contact:
        return jsonify({"error": "Contact not found"}), 404

    db.session.delete(contact)
    db.session.commit()

    return jsonify({"message": f"Contact with ID {contact_id} deleted successfully"}), 200

# ✅ BULK DELETE contacts
@contact_bp.route('/bulk-delete', methods=['DELETE'])
def bulk_delete_contacts():
    try:
        data = request.get_json(force=True)
        ids = data.get('ids')

        if not ids or not isinstance(ids, list):
            return jsonify({"error": "Please provide a list of contact IDs"}), 400

        contacts = ContactList.query.filter(ContactList.contact_id.in_(ids)).all()
        if not contacts:
            return jsonify({"error": "No matching contacts found"}), 404

        for contact in contacts:
            db.session.delete(contact)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": f"{len(contacts)} contacts deleted successfully.",
            "deleted_ids": [contact.contact_id for contact in contacts]
        }), 200

    except Exception as e:
        return jsonify({"error": f"Internal error: {str(e)}"}), 500

