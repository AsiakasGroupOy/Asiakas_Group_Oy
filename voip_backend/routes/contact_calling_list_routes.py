from flask import Blueprint, request, jsonify
from extensions import db
from sqlalchemy.orm import aliased
from sqlalchemy.sql import over
from sqlalchemy import asc, func
from models.models import ContactList, CallingList, ContactCallingList, Organization, CallLog   

contact_callinglist_bp = Blueprint('contact_callinglist_bp', __name__)

# ✅ GET data for CallView from Contact Calling List(s) where Calling List is filtered by first concal_id
@contact_callinglist_bp.route('/first', methods=['GET'])
def get_contact_calling_list_By_firstCCLId():
    first_concal_id = db.session.query(func.min(ContactCallingList.concal_id)).scalar()
   
    if not first_concal_id:
        return jsonify({"error": "Contact and Calling List is empty"}), 404
    
    first_concal = ContactCallingList.query.get(first_concal_id)
    calling_list_id = first_concal.calling_list_id

    results= (
        db.session.query( 
            ContactCallingList.concal_id,
            ContactCallingList.note, 
            ContactCallingList.contact_id, 
            ContactList.first_name, 
            ContactList.last_name,
            ContactList.email,
            ContactList.phone,
            ContactList.job_title,
            Organization.organization_name,
            Organization.website,
            CallingList.calling_list_id,
            CallingList.calling_list_name,
            CallLog.status,
            CallLog.call_timestamp
     )
        .select_from(ContactCallingList)
        .join (ContactList, ContactCallingList.contact_id == ContactList.contact_id)
        .join (Organization, Organization.organization_id == ContactList.organization_id)
        .join (CallingList, CallingList.calling_list_id == ContactCallingList.calling_list_id)
        .filter(ContactCallingList.calling_list_id == calling_list_id) #only there calling list is equal to calling list of minimum concal_id from ContactCallingList 
        .outerjoin (CallLog, ContactCallingList.concal_id == CallLog.concal_id)
        .order_by(Organization.organization_name.asc(),)
        . all()
     )
    
    # Format results
    data = []
    seen = {}  # To track which concal_id is already processed, map concal_id -> index in data

    for row in results:
        concal_id = row.concal_id
        
        if concal_id not in seen:
            # New contact entry
            item = {
                "concal": {
                    "concal_id": concal_id,
                    "note": row.note if row.note else None
                },
                "contact": {
                    "contact_id": row.contact_id,
                    "first_name": row.first_name,
                    "last_name": row.last_name,
                    "email": row.email,
                    "phone": row.phone,
                    "job_title": row.job_title,
                    "organization_name": row.organization_name,
                    "website": row.website,
                },
                "calling_list": {
                    "calling_list_id": row.calling_list_id,
                    "calling_list_name": row.calling_list_name,
                },
                "call_log": []
            }
            data.append(item)
            seen[concal_id] = len(data) - 1  # Store index
        
        # Append call_log if exists
        if row.call_timestamp:
            data[seen[concal_id]]["call_log"].append({
                "status": row.status,
                "call_timestamp": row.call_timestamp.isoformat()
            })
            
    return jsonify(data), 200

# ✅ GET data for CallView from Contact Calling List(s) where Calling List is filtered by concal_id from selected row in ContactList passed by location.state
@contact_callinglist_bp.route('/<int:concal_id>/navid', methods=['GET'])
def get_contact_calling_list_By_SelectedRowId(concal_id): # Get the concal_id from the request arguments
    
    if not concal_id:
        return jsonify({"error": "Selected contact is required"}), 400
    
    navId_concal = ContactCallingList.query.get(concal_id)
    calling_list_id = navId_concal.calling_list_id

    # Query to get all Contact Calling List entries for the given concal_id
    results = (
        db.session.query(
            ContactCallingList.concal_id,
            ContactCallingList.note,
            ContactCallingList.contact_id,
            ContactList.first_name,
            ContactList.last_name,
            ContactList.email,
            ContactList.phone,
            ContactList.job_title,
            Organization.organization_name,
            Organization.website,
            CallingList.calling_list_id,
            CallingList.calling_list_name,
            CallLog.status,
            CallLog.call_timestamp
        )
        .select_from(ContactCallingList)
        .join(ContactList, ContactCallingList.contact_id == ContactList.contact_id)
        .join(Organization, Organization.organization_id == ContactList.organization_id)
        .join(CallingList, CallingList.calling_list_id == ContactCallingList.calling_list_id)
        .outerjoin(CallLog, ContactCallingList.concal_id == CallLog.concal_id)
        .filter(ContactCallingList.calling_list_id == calling_list_id)
        .order_by(Organization.organization_name.asc())
        .all()
    )

    # Format results
    data = []
    seen = {}  # To track which concal_id is already processed, map concal_id -> index in data

    for row in results:
        concal_id = row.concal_id
        
        if concal_id not in seen:
            # New contact entry
            item = {
                "concal": {
                    "concal_id": concal_id,
                    "note": row.note if row.note else None
                },
                "contact": {
                    "contact_id": row.contact_id,
                    "first_name": row.first_name,
                    "last_name": row.last_name,
                    "email": row.email,
                    "phone": row.phone,
                    "job_title": row.job_title,
                    "organization_name": row.organization_name,
                    "website": row.website,
                },
                "calling_list": {
                    "calling_list_id": row.calling_list_id,
                    "calling_list_name": row.calling_list_name,
                },
                "call_log": []
            }
            data.append(item)
            seen[concal_id] = len(data) - 1  # Store index
        
        # Append call_log if exists
        if row.call_timestamp:
            data[seen[concal_id]]["call_log"].append({
                "status": row.status,
                "call_timestamp": row.call_timestamp.isoformat()
            })
    print(data)
    return jsonify(data), 200


# ✅ GET data for CallView from Contact Calling list By Calling List Name
@contact_callinglist_bp.route('/<string:name>/calllistname', methods=['GET'])
def get_contact_calling_list_By_CallingListName(name): 
      
    calling_list = CallingList.query.filter_by(calling_list_name=name).first()  # Get the calling_list_id from the request arguments
    calling_list_id = calling_list.calling_list_id

    # Query to get all Contact Calling List entries for the given concal_id
    results = (
        db.session.query(
            ContactCallingList.concal_id,
            ContactCallingList.note,
            ContactCallingList.contact_id,
            ContactList.first_name,
            ContactList.last_name,
            ContactList.email,
            ContactList.phone,
            ContactList.job_title,
            Organization.organization_name,
            Organization.website,
            CallingList.calling_list_id,
            CallingList.calling_list_name,
            CallLog.status,
            CallLog.call_timestamp
        )
        .select_from(ContactCallingList)
        .join(ContactList, ContactCallingList.contact_id == ContactList.contact_id)
        .join(Organization, Organization.organization_id == ContactList.organization_id)
        .join(CallingList, CallingList.calling_list_id == ContactCallingList.calling_list_id)
        .outerjoin(CallLog, ContactCallingList.concal_id == CallLog.concal_id)
        .filter(ContactCallingList.calling_list_id == calling_list_id)
        .order_by(Organization.organization_name.asc())
        .all()
    )

    # Format results
    data = []
    seen = {}  # To track which concal_id is already processed, map concal_id -> index in data

    for row in results:
        concal_id = row.concal_id
        
        if concal_id not in seen:
            # New contact entry
            item = {
                "concal": {
                    "concal_id": concal_id,
                    "note": row.note if row.note else None
                },
                "contact": {
                    "contact_id": row.contact_id,
                    "first_name": row.first_name,
                    "last_name": row.last_name,
                    "email": row.email,
                    "phone": row.phone,
                    "job_title": row.job_title,
                    "organization_name": row.organization_name,
                    "website": row.website,
                },
                "calling_list": {
                    "calling_list_id": row.calling_list_id,
                    "calling_list_name": row.calling_list_name,
                },
                "call_log": []
            }
            data.append(item)
            seen[concal_id] = len(data) - 1  # Store index
        
        # Append call_log if exists
        if row.call_timestamp:
            data[seen[concal_id]]["call_log"].append({
                "status": row.status,
                "call_timestamp": row.call_timestamp.isoformat()
            })
    print(data)
    return jsonify(data), 200


# ✅ GET data for a Contact List view 
@contact_callinglist_bp.route('/all', methods=['GET'])
def get_contact_calling_list_full():

    # Subquery to get the latest call log for each concal_id
    log_ranked = (
    db.session.query(
        CallLog.call_id,
        CallLog.concal_id,
        CallLog.status,
        CallLog.call_timestamp,
        func.row_number().over(
            partition_by=CallLog.concal_id,
            order_by=CallLog.call_timestamp.desc()
        ).label('rn')
    ).subquery()
    )
    # Subquery to count calls per concal_id
    call_count_subq = (
    db.session.query(
        CallLog.concal_id.label("concal_id"),
        func.count(CallLog.call_id).label("call_count")
    )
    .group_by(CallLog.concal_id)
    .subquery()
    )
  
    LatestLog = aliased(log_ranked)
    
    # Main query: join all tables and latest call log
    results = (
        db.session.query(
            ContactCallingList.concal_id,
            ContactList.contact_id,
            ContactList.first_name,
            ContactList.last_name,
            ContactList.phone,
            Organization.organization_name,
            Organization.website,
            CallingList.calling_list_id,
            CallingList.calling_list_name,
            LatestLog.c.status.label('latest_status'),
            LatestLog.c.call_timestamp.label('latest_call_timestamp'),
            call_count_subq.c.call_count.label("call_count")
        )
        .select_from(ContactCallingList)
        .join(ContactList, ContactCallingList.contact_id == ContactList.contact_id)
        .join(CallingList, ContactCallingList.calling_list_id == CallingList.calling_list_id)
        .join(Organization, ContactList.organization_id == Organization.organization_id)
        .outerjoin(LatestLog, (ContactCallingList.concal_id == LatestLog.c.concal_id) & (LatestLog.c.rn == 1))
        .outerjoin(call_count_subq, ContactCallingList.concal_id == call_count_subq.c.concal_id)
        .order_by(CallingList.calling_list_name.asc(),
                  Organization.organization_name.asc(),)
        .all()
    )
      
    # Format results
    data = []
    for row in results:
        data.append({
            "concal_id": row.concal_id,
            
            "contact": {
                "contact_id": row.contact_id,
                "first_name": row.first_name,
                "last_name": row.last_name,
                "phone": row.phone,
                               
                "organization_name": row.organization_name,
                "website": row.website,
            },
            "calling_list": {
                "calling_list_id": row.calling_list_id,
                "calling_list_name": row.calling_list_name,
            },
            "latest_call_log": {
                "status": row.latest_status if row.latest_status else None,
                "call_timestamp": row.latest_call_timestamp.isoformat() if row.latest_call_timestamp else None,
                "call_count": row.call_count if row.call_count else None
            }
        })

    return jsonify(data), 200

# ✅ DELETE Contact(s) from Calling List(s) or Calling List(s) from Contact(s)
@contact_callinglist_bp.route('/remove', methods=['POST'])
def remove():
    data = request.get_json()
    deleted_count = 0
    contact_ids_to_check = set()
    list_ids_to_check = set()
    org_ids_to_check = set()

    # 1. Bulk delete junction table rows and collect contacts/lists to check
    for item in data:
        con_id = item.get('contact_id')
        call_id = item.get('calling_list_id')
        concal_id = item.get('concal_id')

        if con_id is None or call_id is None:
                continue

        rows = (
                    db.session.query(ContactCallingList)
                            .filter_by(concal_id=concal_id)
                            .delete(synchronize_session=False)
                )
        deleted_count += rows

        contact_ids_to_check.add(con_id)
        list_ids_to_check.add(call_id)




    # Delete contact if not in any calling list and collect their org_ids
    for con_id in contact_ids_to_check:
        remaining = (
            db.session.query(ContactCallingList)
                      .filter_by(contact_id=con_id)
                      .count()
        )
        if remaining == 0:
            contact = ContactList.query.get(con_id)
            if contact:
                # remember this org for later cleanup
                if contact.organization_id:
                    org_ids_to_check.add(contact.organization_id)
                db.session.delete(contact)

    # Delete calling list if it has no contacts
    for call_id in list_ids_to_check:
        remaining = (
            db.session.query(ContactCallingList)
                      .filter_by(calling_list_id=call_id)
                      .count()
        )
        if remaining == 0:
            db.session.query(CallingList).filter_by(calling_list_id=call_id).delete()

    # 4. Delete orphaned organizations
    for org_id in org_ids_to_check:
        remaining_contacts = (
            db.session.query(ContactList)
                      .filter_by(organization_id=org_id)
                      .count()
        )
        if remaining_contacts == 0:
            db.session.query(Organization).filter_by(organization_id=org_id).delete()        

    # 5. Single commit
    db.session.commit()

    return jsonify({
        "message": f"Removed {deleted_count} row(s).",
        "removed_contacts": list(contact_ids_to_check),
        "removed_lists": list(list_ids_to_check),
        "removed_orgs": list(org_ids_to_check)
    }), 200

# ✅ Edit note in Contact Calling List
@contact_callinglist_bp.route('/<int:concal_id>/note', methods=['PUT'])
def update_note(concal_id):
    data = request.get_json()
    note = data.get('note')

    concal = ContactCallingList.query.get(concal_id)
    if not concal:
        return jsonify({"error": "Contact Calling List not found"}), 404

    concal.note = note
    db.session.commit()

    return jsonify({"message": "Note updated successfully"}), 200