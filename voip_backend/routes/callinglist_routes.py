from logging import Manager
from flask import Blueprint, request, jsonify,g
from extensions import db
from models.models import CallingList
from schemas.calling_list_schemas import CallingListSchema  
from helpers.helpers import auth_required

callinglist_bp = Blueprint('callinglist_bp', __name__)
calling_list_schema = CallingListSchema()
calling_lists_schema = CallingListSchema(many=True)

# ✅ GET all calling lists (non-paginated)
@callinglist_bp.route('/all', methods=['GET'])
@auth_required
def get_all_calling_lists():
    calling_lists = CallingList.query.filter_by(customer_id = g.customer_id).all()
    return jsonify(calling_lists_schema.dump(calling_lists)), 200



