from flask import Blueprint, request, jsonify
from extensions import db
from sqlalchemy.orm import aliased
from sqlalchemy import desc
from models.models import ContactList, CallingList, ContactCallingList, Organization, CallLog

contact_calllist_bp = Blueprint('contact_calllist_bp', __name__)

# ✅ GET data for a Contact List view
@contact_calllist_bp.route('/all', methods=['GET'])
def get_contact_calling_list_full():
    # Aliased for subquery to get latest call log per contact
    LatestCallLog = aliased(CallLog)

    # Subquery: get latest call log id for each contact
    subq = (
        db.session.query(
            CallLog.contact_id,
            db.func.max(CallLog.call_timestamp).label('max_time')
        ).group_by(CallLog.contact_id).subquery()
    )

    # Main query: join all tables and latest call log
    results = (
        db.session.query(
            ContactCallingList.concal_id,
            ContactList.contact_id,
            ContactList.first_name,
            ContactList.last_name,
            ContactList.email,
            ContactList.phone,
            ContactList.job_title,
            ContactList.note,
            Organization.organization_name,
            Organization.website,
            CallingList.calling_list_id,
            CallingList.calling_list_name,
            LatestCallLog.call_id.label('latest_call_id'),
            LatestCallLog.status_id.label('latest_status_id'),
            LatestCallLog.call_timestamp.label('latest_call_timestamp')
        )
        .join(ContactList, ContactCallingList.contact_id == ContactList.contact_id)
        .join(CallingList, ContactCallingList.calling_list_id == CallingList.calling_list_id)
        .outerjoin(Organization, ContactList.organization_id == Organization.organization_id)
        .outerjoin(
            subq,
            (ContactList.contact_id == subq.c.contact_id)
        )
        .outerjoin(
            LatestCallLog,
            (LatestCallLog.contact_id == ContactList.contact_id) &
            (LatestCallLog.call_timestamp == subq.c.max_time)
        )
        .all()
    )
    print("Results:", results)  
    # Format results
    data = []
    for row in results:
        data.append({
            "concal_id": row.concal_id,
            "contact": {
                "contact_id": row.contact_id,
                "first_name": row.first_name,
                "last_name": row.last_name,
                "email": row.email,
                "phone": row.phone,
                "job_title": row.job_title,
                "note": row.note,
                "organization_name": row.organization_name,
                "website": row.website,
            },
            "calling_list": {
                "calling_list_id": row.calling_list_id,
                "calling_list_name": row.calling_list_name,
            },
            "latest_call_log": {
                "call_id": row.latest_call_id,
                "status_id": row.latest_status_id,
                "call_timestamp": row.latest_call_timestamp.isoformat() if row.latest_call_timestamp else None,
            } if row.latest_call_id else None
        })

    return jsonify(data), 200

# ✅ DELETE Contact(s) from Calling List(s) or Calling List(s) from Contact(s)
@contact_calllist_bp.route('/remove', methods=['POST'])
def remove():
    data = request.get_json()
    deleted_count = 0
    contact_ids_to_check = set()
    list_ids_to_check = set()

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




    # Delete contact if not in any calling list
    for con_id in contact_ids_to_check:
        remaining = (
            db.session.query(ContactCallingList)
                      .filter_by(contact_id=con_id)
                      .count()
        )
        if remaining == 0:
            db.session.query(ContactList).filter_by(contact_id=con_id).delete()

    # Delete calling list if it has no contacts
    for call_id in list_ids_to_check:
        remaining = (
            db.session.query(ContactCallingList)
                      .filter_by(calling_list_id=call_id)
                      .count()
        )
        if remaining == 0:
            db.session.query(CallingList).filter_by(calling_list_id=call_id).delete()

    # 4. Single commit
    db.session.commit()

    return jsonify({
        "message": f"Removed {deleted_count} row(s).",
        "removed_contacts": list(contact_ids_to_check),
        "removed_lists": list(list_ids_to_check)
    }), 200