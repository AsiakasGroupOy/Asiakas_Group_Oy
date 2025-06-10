from flask import Blueprint, request, jsonify
from extensions import db
from models.models import CallingList
from schemas.calling_list_schemas import CallingListSchema  

callinglist_bp = Blueprint('callinglist_bp', __name__)
calling_list_schema = CallingListSchema()
calling_lists_schema = CallingListSchema(many=True)

# ✅ GET all calling lists (non-paginated)
@callinglist_bp.route('/all', methods=['GET'])
def get_all_calling_lists():
    calling_lists = CallingList.query.all()
    return jsonify(calling_lists_schema.dump(calling_lists)), 200


# ✅ CREATE a new calling list
@callinglist_bp.route('/', methods=['POST'])
def create_calling_list():
    data = request.get_json()
    calling_list_name = data.get('calling_list_name')

    if not calling_list_name:
        return jsonify({"error": "Calling List Name is required."}), 400

    if CallingList.query.filter_by(calling_list_name=calling_list_name).first():
        return jsonify({"error": "Calling List with this name already exists."}), 400

    new_calling_list = CallingList(calling_list_name=calling_list_name)
    db.session.add(new_calling_list)
    db.session.commit()

    return jsonify(calling_list_schema.dump(new_calling_list)), 201

