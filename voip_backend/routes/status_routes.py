from flask import Blueprint, jsonify
from models.models import Status

# Create Blueprint
status_bp = Blueprint('status_bp', __name__)

# 📌 GET all statuses (primary endpoint)
@status_bp.route('/', methods=['GET'])
def get_statuses():
    statuses = Status.query.all()
    return jsonify([s.serialize() for s in statuses]), 200

# 📌 GET all statuses (alias for consistency, optional)
@status_bp.route('/all', methods=['GET'])
def get_all_statuses():
    statuses = Status.query.all()
    return jsonify([s.serialize() for s in statuses]), 200

# 📌 GET a single status by ID
@status_bp.route('/<int:status_id>', methods=['GET'])
def get_status(status_id):
    status = Status.query.get(status_id)
    if status:
        return jsonify(status.serialize()), 200
    return jsonify({"error": "Status not found"}), 404

