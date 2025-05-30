from flask import Blueprint, request, jsonify
from extensions import db
from models.models import ContactList, Organization, CallingList, ContactCallingList
from schemas.contact_schemas import ContactSchema
import re

contact_bp = Blueprint('contact_bp', __name__)
contact_schema = ContactSchema()
contacts_schema = ContactSchema(many=True)

# 📌 Helper: Validate email format
def is_valid_email(email):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None


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
   

    # Organization
    organization = None
    organization_name = data.get('organization_name')
    if organization_name:
        organization = Organization.query.filter_by(organization_name=organization_name).first()
        if not organization:
            organization = Organization(organization_name=organization_name)
            db.session.add(organization)
            db.session.commit()

    # Calling List (by name)
    calling_list = None
    calling_list_name = data.get('calling_list_name')
    if calling_list_name:
        calling_list = CallingList.query.filter_by(calling_list_name=calling_list_name).first()
        if not calling_list:
            calling_list = CallingList(calling_list_name=calling_list_name)
            db.session.add(calling_list)
            db.session.commit()

    new_contact = ContactList(
        first_name=first_name,
        last_name=last_name,
        job_title=data.get('job_title'),
        phone=data.get('phone'),
        email=email,
        note=data.get('note'),
        organization_id=organization.organization_id if organization else None,
        
    )

    db.session.add(new_contact)
    db.session.commit()

    # ✅ Create the connection in contact_calling_list
    if calling_list:
        connection = ContactCallingList(
            contact_id=new_contact.contact_id,
            calling_list_id=calling_list.calling_list_id
        )
        db.session.add(connection)
        db.session.commit()


#  # ✅ Check if the contact is already in the calling list before adding
 #   if calling_list:
 #       exists = ContactCallingList.query.filter_by(
 #           contact_id=new_contact.contact_id,
 #           calling_list_id=calling_list.calling_list_id
 #       ).first()
 #       if not exists:
 #           connection = ContactCallingList(
 #               contact_id=new_contact.contact_id,
 #               calling_list_id=calling_list.calling_list_id
 #           )
 #           db.session.add(connection)
 #           db.session.commit()

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



