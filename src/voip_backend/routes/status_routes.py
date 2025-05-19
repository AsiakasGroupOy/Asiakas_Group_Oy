from flask import Blueprint, jsonify
from src.voip_backend.models.models import Status
from src.voip_backend.schemas.status_schemas import StatusSchema  # ✅ Import schema

status_bp = Blueprint('status_bp', __name__)

status_schema = StatusSchema()
statuses_schema = StatusSchema(many=True)

# ✅ GET all statuses (primary endpoint)
@status_bp.route('/', methods=['GET'])
def get_statuses():
    statuses = Status.query.all()
    return jsonify(statuses_schema.dump(statuses)), 200

# ✅ GET all statuses (alias for consistency)
@status_bp.route('/all', methods=['GET'])
def get_all_statuses():
    statuses = Status.query.all()
    return jsonify(statuses_schema.dump(statuses)), 200

# ✅ GET a single status by ID
@status_bp.route('/<int:status_id>', methods=['GET'])
def get_status(status_id):
    status = Status.query.get(status_id)
    if status:
        return jsonify(status_schema.dump(status)), 200
    return jsonify({"error": "Status not found"}), 404
