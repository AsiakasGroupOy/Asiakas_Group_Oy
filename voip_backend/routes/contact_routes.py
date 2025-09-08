from flask import Blueprint, request, jsonify,json
from extensions import db
from models.models import ContactList, Organization, CallingList, ContactCallingList
from schemas.contact_schemas import ContactSchema
from sqlalchemy.exc import IntegrityError, DataError, SQLAlchemyError
import pandas as pd
import re
import logging

contact_bp = Blueprint('contact_bp', __name__)
contact_schema = ContactSchema()
contacts_schema = ContactSchema(many=True)

logger = logging.getLogger('contact_bp')
logger.setLevel(logging.INFO)

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

def validate_phone(phone):
    # basic phone validation: digits and +, -, spaces
    if not phone:
        return False
    return re.match(r"^[\d\s\+\-]+$", phone)

@contact_bp.route('/upload_contacts', methods=['POST'])
def upload_contacts():

    calling_list_name = request.form['callingList']
    if not calling_list_name:
        return jsonify({"error": "Calling list name is required"}), 400
    
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']

    if file.content_length > MAX_FILE_SIZE:
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
        mapping = json.loads(request.form['mapping'])
    except Exception:
        return jsonify({"error": "Invalid mapping JSON"}), 400

    if not mapping:
        return jsonify({"error": "No mapping provided"}), 400


    clean_rows = []
    for _, row in df.iterrows():
        new_row = {}
        for header in user_headers:  # original order
            mapped_option = mapping.get(header, "Do not import")
            sys_col = SYSTEM_FIELDS.get(mapped_option)
            if sys_col is None:  
                continue  # skip "Do not import"
            value = row[header]
            new_row[sys_col] = None if pd.isna(value) else str(value).strip()
        clean_rows.append(new_row)

    # Prepare for bulk insert 
    warnings = []
    contacts_to_add = []
    connections_to_add = []
    organizations_cache = {}  # cache existing/new organizations by name

    for idx, data in enumerate(clean_rows, start=2):

        first_name = data.get('first_name')
        last_name = data.get('last_name')
        phone = data.get('phone')
        organization_name = data.get('organization_name')
        
     # Validation
        if not phone or not organization_name:
            warnings.append(f"Row {idx}: Missing required field(s)")
            continue

        if not validate_phone(phone):
            warnings.append(f"Row {idx}: Invalid phone format")
            continue

    # Organization
    
        if organization_name in organizations_cache:
            organization = organizations_cache[organization_name]
        else:
            organization = Organization.query.filter_by(organization_name=organization_name).first()
            if not organization:
                organization = Organization(
                    organization_name=organization_name,
                    website=data.get('website')
                )
                db.session.add(organization)
                db.session.flush()  # get organization_id without committing
            organizations_cache[organization_name] = organization

    
        new_contact = ContactList(
        first_name=first_name,
        last_name=last_name,
        job_title=data.get('job_title'),
        email = data.get('email'),
        phone=phone,
        organization_id=organization.organization_id,
        
        )
        contacts_to_add.append(new_contact)


    # --- Prepare connection to calling list (add later after flush)
        connections_to_add.append({
                "contact_obj": new_contact,
                "note": data.get("note")
            })
        

    # --- Bulk commit contacts ---
    try:
        inserted_count = 0    
        if contacts_to_add:
            calling_list = CallingList.query.filter_by(calling_list_name=calling_list_name).first()
            if not calling_list:
                calling_list = CallingList(calling_list_name=calling_list_name)
                db.session.add(calling_list)
                db.session.flush()  # get calling_list_id without committing

            db.session.add_all(contacts_to_add)
            db.session.flush()  # assign contact_ids

        # --- Add contact-calling list connections ---
            for conn in connections_to_add:
                connection = ContactCallingList(
                    contact_id=conn["contact_obj"].contact_id,
                    calling_list_id=calling_list.calling_list_id,
                    note=conn["note"]
                )
                db.session.add(connection)

            db.session.commit()
            inserted_count = len(contacts_to_add) 
            logger.info(f"Inserted {len(contacts_to_add)} contacts successfully.")

    except IntegrityError as e:
        db.session.rollback()
        logger.error(f"IntegrityError: {e.orig}")
        return jsonify({
            "status": "error",
            "message": "Some rows could not be inserted due to duplicate or missing required values.",
        }), 400

    except DataError as e:
        db.session.rollback()
        logger.error(f"DataError: {e.orig}")
        return jsonify({
            "status": "error",
            "message": "Some rows contain invalid or too large values for the database fields.",
         }), 400

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"SQLAlchemyError: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Unexpected database error.",
        }), 500
    
    return jsonify({
        "status": "success",
        "inserted_contacts": inserted_count,
        "warnings": warnings
    }), 200