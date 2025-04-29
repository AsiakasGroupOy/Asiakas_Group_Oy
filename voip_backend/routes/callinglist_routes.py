from flask import Blueprint, request, jsonify
from extensions import db
from models.models import CallingList

# Create Blueprint
callinglist_bp = Blueprint('callinglist_bp', __name__)

# ✅ NEW: GET all calling lists (non-paginated)
@callinglist_bp.route('/all', methods=['GET'])
def get_all_calling_lists():
    calling_lists = CallingList.query.all()
    return jsonify([cl.serialize() for cl in calling_lists]), 200

# 📌 GET all calling lists (this is currently non-paginated too)
@callinglist_bp.route('/', methods=['GET'])
def get_calling_lists():
    calling_lists = CallingList.query.all()
    return jsonify([cl.serialize() for cl in calling_lists]), 200

# 📌 GET a single calling list by ID
@callinglist_bp.route('/<int:calling_list_id>', methods=['GET'])
def get_calling_list(calling_list_id):
    calling_list = CallingList.query.get(calling_list_id)
    if calling_list:
        return jsonify(calling_list.serialize()), 200
    return jsonify({"error": "Calling List not found"}), 404

# 📌 CREATE a new calling list
@callinglist_bp.route('/', methods=['POST'])
def create_calling_list():
    data = request.get_json()

    calling_list_name = data.get('calling_list_name')
    if not calling_list_name:
        return jsonify({"error": "Calling List Name is required."}), 400

    if CallingList.query.filter_by(calling_list_name=calling_list_name).first():
        return jsonify({"error": "Calling List with this name already exists."}), 400

    new_calling_list = CallingList(
        calling_list_name=calling_list_name
    )
    db.session.add(new_calling_list)
    db.session.commit()

    return jsonify(new_calling_list.serialize()), 201

# 📌 UPDATE a calling list
@callinglist_bp.route('/<int:calling_list_id>', methods=['PUT'])
def update_calling_list(calling_list_id):
    calling_list = CallingList.query.get(calling_list_id)
    if not calling_list:
        return jsonify({"error": "Calling List not found"}), 404

    data = request.get_json()
    calling_list.calling_list_name = data.get('calling_list_name', calling_list.calling_list_name)

    db.session.commit()
    return jsonify(calling_list.serialize()), 200

# 📌 DELETE a calling list
@callinglist_bp.route('/bulk-delete', methods=['DELETE'])
def bulk_delete_calling_lists():
    print("bulk_delete_calling_lists route hit")
    try:
        data = request.get_json(force=True)
        ids = data.get('ids')

        if not ids or not isinstance(ids, list):
            return jsonify({"error": "Provide a list of calling list IDs."}), 400

        calling_lists = CallingList.query.filter(CallingList.calling_list_id.in_(ids)).all()

        if not calling_lists:
            return jsonify({"error": "No matching calling lists found."}), 404

        for cl in calling_lists:
            db.session.delete(cl)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": f"{len(calling_lists)} calling lists deleted successfully.",
            "deleted_ids": [cl.calling_list_id for cl in calling_lists]
        }), 200

    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

