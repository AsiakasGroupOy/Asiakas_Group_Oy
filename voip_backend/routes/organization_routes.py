from flask import Blueprint, request, jsonify
from extensions import db
from models.models import Organization

# Create Blueprint
organization_bp = Blueprint('organization_bp', __name__)

# ✅ NEW: GET all organizations (non-paginated)
@organization_bp.route('/all', methods=['GET'])
def get_all_organizations():
    organizations = Organization.query.all()
    return jsonify([o.serialize() for o in organizations]), 200

# 📌 GET all organizations (this could stay or be deprecated)
@organization_bp.route('/', methods=['GET'])
def get_organizations():
    organizations = Organization.query.all()
    return jsonify([o.serialize() for o in organizations]), 200

# 📌 GET a single organization by ID
@organization_bp.route('/<int:organization_id>', methods=['GET'])
def get_organization(organization_id):
    organization = Organization.query.get(organization_id)
    if organization:
        return jsonify(organization.serialize()), 200
    return jsonify({"error": "Organization not found"}), 404

# 📌 CREATE a new organization
@organization_bp.route('/', methods=['POST'])
def create_organization():
    data = request.get_json()

    # Validate required field
    if not data.get('organization_name'):
        return jsonify({"error": "Organization name is required."}), 400

    # Check duplicate organization name
    if Organization.query.filter_by(organization_name=data.get('organization_name')).first():
        return jsonify({"error": "Organization with this name already exists."}), 400

    new_organization = Organization(
        organization_name=data.get('organization_name'),
        website=data.get('website')
    )
    db.session.add(new_organization)
    db.session.commit()

    return jsonify(new_organization.serialize()), 201

# 📌 UPDATE an organization
@organization_bp.route('/<int:organization_id>', methods=['PUT'])
def update_organization(organization_id):
    organization = Organization.query.get(organization_id)
    if not organization:
        return jsonify({"error": "Organization not found"}), 404

    data = request.get_json()

    # Check if trying to rename to an existing organization
    if 'organization_name' in data:
        existing = Organization.query.filter_by(organization_name=data['organization_name']).first()
        if existing and existing.organization_id != organization_id:
            return jsonify({"error": "Another organization with this name already exists."}), 400
        organization.organization_name = data['organization_name']

    if 'website' in data:
        organization.website = data['website']

    db.session.commit()

    return jsonify(organization.serialize()), 200

# 📌 DELETE an organization
@organization_bp.route('/<int:organization_id>', methods=['DELETE'])
def delete_organization(organization_id):
    organization = Organization.query.get(organization_id)
    if not organization:
        return jsonify({"error": "Organization not found"}), 404

    # Prevent deletion if organization has contacts
    if organization.contacts:
        return jsonify({"error": "Cannot delete organization with existing contacts. Delete or reassign contacts first."}), 400

    db.session.delete(organization)
    db.session.commit()

    return jsonify({"message": f"Organization with ID {organization_id} deleted successfully."}), 200
