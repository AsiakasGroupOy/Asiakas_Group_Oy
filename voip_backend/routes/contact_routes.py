from flask import Blueprint, request, jsonify,json,g
from extensions import db
from models.models import ContactList, Organization, CallingList, ContactCallingList
from schemas.contact_schemas import ContactSchema
from sqlalchemy.exc import IntegrityError, DataError, SQLAlchemyError
import pandas as pd
import re
import logging
from helpers.helpers import auth_required
from helpers.validations import validate_phone

contact_bp = Blueprint('contact_bp', __name__)
contact_schema = ContactSchema()
contacts_schema = ContactSchema(many=True)

logger = logging.getLogger(__name__)
security_logger = logging.getLogger("security")

# ✅ CREATE a new contact
@contact_bp.route('/add_one', methods=['POST'])
@auth_required
def create_contact():
    if g.role not in ["Admin Access" , "Manager", "App Admin"]:
        security_logger.error("Unauthorized access attempt: user_id=%s, customer_id=%s", g.get("user_id"), g.get("customer_id"))
        return jsonify({"error": "Forbidden"}), 403
    
    data = request.get_json()

    first_name = data.get('first_name', '').strip()
    last_name = data.get('last_name', '').strip()
    if not first_name or not last_name:
      return jsonify({"error": "First name and Last name are required"}), 400
    
    phone=data.get('phone', '').strip()
    phone = validate_phone(phone)
    if not phone:
        return jsonify({"error": "Phone number is required and must contain only digits with an optional '+' at the start, 6 to 15 digits long."}), 400

  
    # Organization
    organization = None
    organization_name = data.get('organization_name', '').strip()
    if not organization_name:
        return jsonify({"error": "Organization name is required"}), 400
    
    try:
        organization = Organization.query.filter_by(organization_name=organization_name, customer_id=g.customer_id).first()
        if not organization:
                organization = Organization(
                    organization_name=organization_name,
                    website=data.get('website', '').strip(),
                    customer_id=g.customer_id)
                
                db.session.add(organization)
                db.session.flush()

        # Calling List (by name)
        calling_list = None
        calling_list_name = data.get('calling_list_name', '').strip()
        if not calling_list_name:
            return jsonify({"error": "Calling list name is required"}), 400
        
        if calling_list_name:
            calling_list = CallingList.query.filter_by(calling_list_name=calling_list_name, customer_id=g.customer_id).first()
            if not calling_list:
                calling_list = CallingList(
                    calling_list_name=calling_list_name,
                    customer_id=g.customer_id)
                db.session.add(calling_list)
                db.session.flush()

        new_contact = ContactList(
            first_name=first_name,
            last_name=last_name,
            job_title=data.get('job_title', '').strip(),
            email = data.get('email', '').strip(),
            phone=phone,
            organization_id=organization.organization_id,
            customer_id=g.customer_id
            
        )

        db.session.add(new_contact)
        db.session.flush()

        # Create the connection in contact_calling_list
        if calling_list:
            connection = ContactCallingList(
                contact_id=new_contact.contact_id,
                calling_list_id=calling_list.calling_list_id,
                customer_id=g.customer_id,
                note=data.get('note', '').strip()
            )
            db.session.add(connection)

    
            db.session.commit()

    except IntegrityError as e:
        db.session.rollback()
        logger.error("IntegrityError: %s, user_id=%s, customer_id=%s", g.get("user_id"),  g.get("customer_id"), str(e))
        return jsonify({"message": "Some rows could not be inserted due to duplicate or missing required values."}), 400

    except DataError as e:
        db.session.rollback()
        logger.error("DataError: %s, user_id=%s, customer_id=%s", g.get("user_id"),  g.get("customer_id"), str(e))
        return jsonify({"message": "Some rows contain invalid or too large values for the database fields."}), 400

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error("SQLAlchemyError: %s, user_id=%s, customer_id=%s", g.get("user_id"),  g.get("customer_id"), str(e))
        return jsonify({"message": "Unexpected database error."}), 500
        
    return jsonify({"message": "Contact added successfully"}), 201  
        


# ✅ CREATE new contacts from upload file
MAX_FILE_SIZE = 5 * 1024 * 1024

SYSTEM_FIELDS = {
    "First Name": "first_name",
    "Last Name": "last_name",
    "Email": "email",
    "Phone (required)": "phone",
    "Job Title": "job_title",
    "Organization name": "organization_name",
    "Organization website": "website",
    "Note": "note",
    "Do not import": None
}

@contact_bp.route('/upload_contacts', methods=['POST'])
@auth_required
def upload_contacts():
    if g.role not in ["Admin Access" , "Manager", "App Admin"]:
        security_logger.error("Unauthorized access attempt by user to upload contacts: user_id=%s, customer_id=%s", g.get("user_id"),  g.get("customer_id"))
        return jsonify({"error": "Forbidden"}), 403
    
    calling_list_name = request.form.get('callingList', '').strip()
    if not calling_list_name:
        return jsonify({"error": "Calling list name is required"}), 400
    
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']

    if request.content_length and request.content_length > MAX_FILE_SIZE:
        return jsonify({"error": "File is too large"}), 400
    
    file_name = file.filename
    
    try:
        if file_name.endswith('.csv'):
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)
    except Exception as e:
        return jsonify({"error": f"Could not read file: {str(e)}"}), 400
    
    user_headers = list(df.columns) # preserve original order
   
    try:
        mapping_raw = request.form.get('mapping')
        if not mapping_raw:
            return jsonify({"error": "No mapping provided"}), 400
        
        mapping = json.loads(mapping_raw)
    except Exception:
        return jsonify({"error": "Invalid mapping JSON"}), 400

    if not mapping:
        return jsonify({"error": "No mapping provided"}), 400


    contacts_to_add = []
    connections_to_add = []
    organizations_cache = {}  # cache existing/new organizations by name
    warnings = []

    calling_list = CallingList.query.filter_by(calling_list_name=calling_list_name, customer_id=g.customer_id ).first()
    if not calling_list:
        calling_list = CallingList(
            calling_list_name=calling_list_name, 
            customer_id=g.customer_id
        )
        db.session.add(calling_list)
        db.session.flush()  # get calling_list_id without committing

    # Start at 2 because row 1 in the file is typically the header row
    
    try:
        for idx, row in df.iterrows():
            new_row = {}
            for header in user_headers:  # original order
                mapped_option = mapping.get(header, "Do not import")
                sys_col = SYSTEM_FIELDS.get(mapped_option)
                if sys_col is None:  
                    continue  # skip "Do not import"
                value = row[header]
                if pd.isna(value):
                    continue  # skip "Do not import"
                elif isinstance(value, str):
                    new_row[sys_col] = value.strip()
                else:
                    new_row[sys_col] = str(value)
        
            first_name = new_row.get('first_name', '').strip()
            last_name = new_row.get('last_name', '').strip()
            phone = new_row.get('phone', '').strip()
            organization_name = new_row.get('organization_name', '').strip()
            
        # Validation
            if not phone or not organization_name:
                warnings.append(f"Row {idx+2}: Missing required field(s) phone or organization name")
                continue
            phone = validate_phone(phone)
            if not phone:
                warnings.append(f"Row {idx+2}: Invalid phone format")
                continue

        # Organization
        
            if organization_name in organizations_cache:
                organization = organizations_cache[organization_name]
            else:
                organization = Organization.query.filter_by(organization_name=organization_name,customer_id=g.customer_id).first()
                if not organization:
                    organization = Organization(
                        organization_name=organization_name,
                        website=new_row.get('website', '').strip(),
                        customer_id=g.customer_id
                    )
                    db.session.add(organization)
                    db.session.flush()  # get organization_id without committing
                organizations_cache[organization_name] = organization

        
            new_contact = ContactList(
            first_name=first_name,
            last_name=last_name,
            job_title=new_row.get('job_title', '').strip(),
            email = new_row.get('email', '').strip(),
            phone=phone,
            organization_id=organization.organization_id,
            customer_id=g.customer_id
            
            )
            contacts_to_add.append(new_contact)


        # --- Prepare connection to calling list (add later after flush)
            connections_to_add.append({
                    "contact_obj": new_contact,
                    "note": new_row.get("note", '').strip()
                })
            

        # --- Bulk commit contacts ---
        
        inserted_count = 0    
        if contacts_to_add:
                
                db.session.add_all(contacts_to_add)
                db.session.flush()  # assign contact_ids

            # --- Add contact-calling list connections ---
                for conn in connections_to_add:
                    connection = ContactCallingList(
                        contact_id=conn["contact_obj"].contact_id,
                        calling_list_id=calling_list.calling_list_id,
                        note=conn["note"],
                        customer_id=g.customer_id
                    )
                    db.session.add(connection)

                db.session.commit()
                inserted_count = len(contacts_to_add) 
                logger.info(f"Inserted {len(contacts_to_add)} contacts successfully.")

    except IntegrityError as e:
        db.session.rollback()
        logger.error("IntegrityError: %s, user_id=%s, customer_id=%s", g.get("user_id"),  g.get("customer_id"), str(e))
        return jsonify({"message": "Some rows could not be inserted due to duplicate or missing required values."}), 400

    except DataError as e:
        db.session.rollback()
        logger.error("DataError: %s, user_id=%s, customer_id=%s", g.get("user_id"),  g.get("customer_id"), str(e))
        return jsonify({"message": "Some rows contain invalid or too large values for the database fields."}), 400

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error("SQLAlchemyError: %s, user_id=%s, customer_id=%s", g.get("user_id"),  g.get("customer_id"), str(e))
        return jsonify({"message": "Unexpected database error."}), 500
    
    return jsonify({
        "inserted_contacts": inserted_count,
        "warnings": warnings
    }), 200


@contact_bp.route('/edit', methods=['PUT'])
@auth_required
def update_contact():
    data = request.get_json()
    contact_id= data.get('contact_id')
    contact = ContactList.query.get(contact_id)
    
    if not contact:
        return jsonify({"error": "Contact not found"}), 404

    phone = data.get('phone', '').strip()
    phone = validate_phone(phone)
    if not phone:
        return jsonify({"error": "Phone number is required and must contain only digits with an optional '+' at the start, 6 to 15 digits long."}), 400

    contact.first_name = data.get('first_name', '').strip()
    contact.last_name = data.get('last_name', '').strip()
    contact.job_title=data.get('job_title', '').strip(),
    contact.email = data.get('email', '').strip(),
    contact.phone=phone

    db.session.commit()

    return jsonify({"message": "Contact updated successfully"}), 200