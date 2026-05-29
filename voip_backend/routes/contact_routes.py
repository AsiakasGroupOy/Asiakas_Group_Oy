from flask import Blueprint, request, jsonify,json,g
from extensions import db
from models.models import ContactList, Organization, CallingList, ContactCallingList
from schemas.contact_schemas import ContactSchema
from sqlalchemy.exc import IntegrityError, DataError, SQLAlchemyError
import pandas as pd
import logging
from helpers.helpers import auth_required
from helpers.validations import validate_phone

contact_bp = Blueprint('contact_bp', __name__)
contact_schema = ContactSchema()
contacts_schema = ContactSchema(many=True)

security_logger = logging.getLogger("security")
audit_logger = logging.getLogger("audit")
app_logger = logging.getLogger("app")

# ✅ CREATE a new contact
@contact_bp.route('/add_one', methods=['POST'])
@auth_required
def create_contact():
    if g.role not in ["Admin Access" , "Manager", "App Admin"]:
        security_logger.error("Unauthorized attempt to create contact: user_id=%s, customer_id=%s method=%s path=%s ip=%s", g.user_id, g.customer_id, request.method, request.path, request.remote_addr)
        return jsonify({"error": "Forbidden"}), 403
    
    data = request.get_json()

    first_name = data.get('first_name', '').strip()
    last_name = data.get('last_name', '').strip()
    if not first_name or not last_name:
      app_logger.warning("Validation failed: first_name or last_name missing: user_id=%s, customer_id=%s, method=%s, path=%s",g.user_id, g.customer_id, request.method, request.path)
      return jsonify({"error": "nameRequired"}), 400
    
    phone=data.get('phone', '').strip()

    phone = validate_phone(phone)
    if not phone:
        app_logger.warning("Validation failed: invalid phone format: user_id=%s, customer_id=%s, method=%s, path=%s",g.user_id, g.customer_id, request.method, request.path)
        return jsonify({"error": "phoneInvalid"}), 400

  
    # Organization
    organization = None
    organization_name = data.get('organization_name', '').strip()
    if not organization_name:
        app_logger.warning("Validation failed: organization_name missing: user_id=%s, customer_id=%s, method=%s, path=%s",g.user_id, g.customer_id, request.method, request.path)
        return jsonify({"error": "organizationRequired"}), 400
    
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
            app_logger.warning("Validation failed: calling_list_name missing: user_id=%s, customer_id=%s, method=%s, path=%s",g.user_id, g.customer_id, request.method, request.path)
            return jsonify({"error": "callingListRequired"}), 400
        
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

            audit_logger.info("Contact CREATED: contact_id=%s contact_name=%s in calling_list=%s by user_id=%s customer_id=%s", new_contact.contact_id, f"{new_contact.first_name} {new_contact.last_name}", calling_list.calling_list_name, g.user_id, g.customer_id)

    except IntegrityError as e:
        db.session.rollback()
        app_logger.error("IntegrityError: %s, user_id=%s, customer_id=%s", g.user_id,  g.customer_id, str(e))
        return jsonify({"error": "duplicateValues"}), 400

    except DataError as e:
        db.session.rollback()
        app_logger.error("DataError: %s, user_id=%s, customer_id=%s", g.user_id,  g.customer_id, str(e))
        return jsonify({"error": "dataError"}), 400

    except SQLAlchemyError as e:
        db.session.rollback()
        app_logger.error("SQLAlchemyError: %s, user_id=%s, customer_id=%s", g.user_id,  g.customer_id, str(e))
        return jsonify({"error": "unexpectedError"}), 500
        
    return jsonify({"message": "successMessage"}), 201  
        


# ✅ CREATE new contacts from upload file
MAX_FILE_SIZE = 5 * 1024 * 1024

SYSTEM_FIELDS = {
    "first_name": "first_name",
    "last_name": "last_name",
    "email": "email",
    "phone": "phone",
    "job_title": "job_title",
    "organization_name": "organization_name",
    "website": "website",
    "note": "note",
    "do_not_import": None
}

@contact_bp.route('/upload_contacts', methods=['POST'])
@auth_required
def upload_contacts():
    if g.role not in ["Admin Access" , "Manager", "App Admin"]:
        security_logger.error("Unauthorized access attempt by user to upload contacts: user_id=%s, customer_id=%s method=%s path=%s ip=%s", g.user_id,  g.customer_id, request.method, request.path, request.remote_addr)
        return jsonify({"error": "Forbidden"}), 403
    
    calling_list_name = request.form.get('callingList', '').strip()
    if not calling_list_name:
        app_logger.warning("Calling list name missing in upload_contacts: user_id=%s, customer_id=%s, method=%s, path=%s",g.user_id, g.customer_id, request.method, request.path)
        return jsonify({"error": "callingListNameRequired"}), 400
    
    if 'file' not in request.files:
        app_logger.warning("No file part in the request in upload_contacts: user_id=%s, customer_id=%s, method=%s, path=%s",g.user_id, g.customer_id, request.method, request.path)
        return jsonify({"error": "noFileProvided"}), 400
    
    file = request.files['file']

    if request.content_length and request.content_length > MAX_FILE_SIZE:
        app_logger.warning("Uploaded file exceeds maximum size in upload_contacts: user_id=%s, customer_id=%s, method=%s, path=%s",g.user_id, g.customer_id, request.method, request.path)  
        return jsonify({"error": "largeFileSize"}), 400
    
    file_name = file.filename
    
    try:
        if file_name.endswith('.csv'):
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)
    except Exception as e:
        app_logger.error("Error reading uploaded file in upload_contacts: user_id=%s, customer_id=%s, method=%s, path=%s, error=%s",g.user_id, g.customer_id, request.method, request.path, str(e))
        return jsonify({"error": "fileReadFailed"}), 400
    
    user_headers = list(df.columns) # preserve original order
   
    try:
        mapping_raw = request.form.get('mapping')
        if not mapping_raw:
            app_logger.warning("No mapping provided in upload_contacts: user_id=%s, customer_id=%s, method=%s, path=%s",g.user_id, g.customer_id, request.method, request.path)
            return jsonify({"error": "noMappingProvided"}), 400
        
        mapping = json.loads(mapping_raw)
    except Exception:
        app_logger.error("Error parsing mapping JSON in upload_contacts: user_id=%s, customer_id=%s, method=%s, path=%s",g.user_id, g.customer_id, request.method, request.path)
        return jsonify({"error": "invalidMappingJSON"}), 400

    if not mapping:
        app_logger.warning("Empty mapping provided in upload_contacts: user_id=%s, customer_id=%s, method=%s, path=%s",g.user_id, g.customer_id, request.method, request.path)
        return jsonify({"error": "noMappingProvided"}), 400


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
                mapped_option = mapping.get(header, "do_not_import")
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
                warnings.append({
                    "code": "missingRequiredFields",
                    "row":idx+2
                })
                continue
            phone = validate_phone(phone)
            if not phone:
                warnings.append({
                    "code": "invalidPhone",
                    "row":idx+2
                })
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
                audit_logger.info("Contact(s) CREATED: contacts=%s in calling_list=%s by user_id=%s customer_id=%s", len(contacts_to_add), calling_list.calling_list_name, g.user_id, g.customer_id)
               

    except IntegrityError as e:
        db.session.rollback()
        app_logger.error("IntegrityError: %s, user_id=%s, customer_id=%s", g.user_id,  g.customer_id, str(e))
        return jsonify({"error": "dbIntegrityErr"}), 400

    except DataError as e:
        db.session.rollback()
        app_logger.error("DataError: %s, user_id=%s, customer_id=%s", g.user_id,  g.customer_id, str(e))
        return jsonify({"error": "dbDataErr"}), 400

    except SQLAlchemyError as e:
        db.session.rollback()
        app_logger.error("SQLAlchemyError: %s, user_id=%s, customer_id=%s", g.user_id,  g.customer_id, str(e))
        return jsonify({"error": "dbUnexpectedErr"}), 500
    
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
        app_logger.warning("Attempt to update non-existent contact: contact_id=%s by user_id=%s customer_id=%s method=%s path=%s ip=%s", contact_id, g.user_id, g.customer_id, request.method, request.path, request.remote_addr)
        return jsonify({"error": "editContactNotFound"}), 404

    phone = data.get('phone', '').strip()
    phone = validate_phone(phone)
    if not phone:
        app_logger.warning("Validation failed: invalid phone format during contact update: contact_id=%s by user_id=%s customer_id=%s method=%s path=%s ip=%s", contact_id, g.user_id, g.customer_id, request.method, request.path, request.remote_addr)
        return jsonify({"error": "phoneUpdateFailed"}), 400

    contact.first_name = data.get('first_name', '').strip()
    contact.last_name = data.get('last_name', '').strip()
    contact.job_title=data.get('job_title', '').strip(),
    contact.email = data.get('email', '').strip(),
    contact.phone=phone

    db.session.commit()
    
    audit_logger.info("Contact UPDATED: contact_id=%s contact_name=%s by user_id=%s customer_id=%s", contact.contact_id, f"{contact.first_name} {contact.last_name}", g.user_id, g.customer_id)

    return jsonify({"message": "Contact updated successfully"}), 200