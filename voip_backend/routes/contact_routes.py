from flask import Blueprint, request, jsonify
from extensions import db
from models.models import ContactList, Organization, CallingList, ContactCallingList
from schemas.contact_schemas import ContactSchema
import re

contact_bp = Blueprint('contact_bp', __name__)
contact_schema = ContactSchema()
contacts_schema = ContactSchema(many=True)


# ✅ CREATE a new contact
@contact_bp.route('/', methods=['POST'])
def create_contact():
    data = request.get_json()

    first_name = data.get('first_name')
    last_name = data.get('last_name')
    if not first_name or not last_name:
      return jsonify({"error": "First name and Last name are required"}), 400
    
    phone=data.get('phone')
    if not phone:
        return jsonify({"error": "Phone number is required"}), 400

    organization_website = data.get('website')

    # Organization
    organization = None
    organization_name = data.get('organization_name')
    if not organization_name:
        return jsonify({"error": "Organization name is required"}), 400
    
    organization = Organization.query.filter_by(organization_name=organization_name).first()
    if not organization:
            organization = Organization(
                organization_name=organization_name,
                website=organization_website)
           
            db.session.add(organization)
            db.session.commit()

    # Calling List (by name)
    calling_list = None
    calling_list_name = data.get('calling_list_name')
    if not calling_list_name:
        return jsonify({"error": "Calling list name is required"}), 400
    
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
        email = data.get('email'),
        phone=phone,
        organization_id=organization.organization_id,
        
    )

    db.session.add(new_contact)
    db.session.commit()

    # Create the connection in contact_calling_list
    if calling_list:
        connection = ContactCallingList(
            contact_id=new_contact.contact_id,
            calling_list_id=calling_list.calling_list_id,
            note=data.get('note')
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

