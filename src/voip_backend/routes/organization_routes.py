"""import os
print("🔥 LOADING:", os.path.abspath(__file__))


from flask import Blueprint, request, jsonify
from src.voip_backend.extensions import db
from src.voip_backend.models.models import Organization
from src.voip_backend.schemas.company_schema import OrganizationSchema  # ✅ Schema import

organization_bp = Blueprint('organization_bp', __name__)

organization_schema = OrganizationSchema()
organizations_schema = OrganizationSchema(many=True)

# ✅ GET all organizations (non-paginated)
@organization_bp.route('/all', methods=['GET'])
def get_all_organizations():
    organizations = Organization.query.all()
    return jsonify(organizations_schema.dump(organizations)), 200

# ✅ GET all organizations (alias)
@organization_bp.route('/', methods=['GET'])
def get_organizations():
    organizations = Organization.query.all()
    return jsonify(organizations_schema.dump(organizations)), 200

# ✅ GET a single organization by ID
@organization_bp.route('/<int:organization_id>', methods=['GET'])
def get_organization(organization_id):
    organization = Organization.query.get(organization_id)
    if organization:
        return jsonify(organization_schema.dump(organization)), 200
    return jsonify({"error": "Organization not found"}), 404

# ✅ CREATE a new organization
@organization_bp.route('/', methods=['POST'])
def create_organization():
    data = request.get_json()

    if not data.get('name'):
        return jsonify({"error": "Organization name is required."}), 400

    if Organization.query.filter_by(organization_name=data['name']).first():
        return jsonify({"error": "Organization with this name already exists."}), 400

    new_organization = Organization(
        organization_name=data['name'],
        address=data.get('address'),
        phone=data.get('phone'),
        email=data.get('email')
    )
    db.session.add(new_organization)
    db.session.commit()

    return jsonify(organization_schema.dump(new_organization)), 201

# ✅ UPDATE an organization
@organization_bp.route('/<int:organization_id>', methods=['PUT'])
def update_organization(organization_id):
    organization = Organization.query.get(organization_id)
    if not organization:
        return jsonify({"error": "Organization not found"}), 404

    data = request.get_json()

    if 'name' in data:
        existing = Organization.query.filter_by(organization_name=data['name']).first()
        if existing and existing.organization_id != organization_id:
            return jsonify({"error": "Another organization with this name already exists."}), 400
        organization.organization_name = data['name']

    if 'address' in data:
        organization.address = data['address']
    if 'phone' in data:
        organization.phone = data['phone']
    if 'email' in data:
        organization.email = data['email']

    db.session.commit()
    return jsonify(organization_schema.dump(organization)), 200

# ✅ DELETE an organization
@organization_bp.route('/<int:organization_id>', methods=['DELETE'])
def delete_organization(organization_id):
    organization = Organization.query.get(organization_id)
    if not organization:
        return jsonify({"error": "Organization not found"}), 404

    if organization.contacts:
        return jsonify({"error": "Cannot delete organization with existing contacts. Delete or reassign contacts first."}), 400

    db.session.delete(organization)
    db.session.commit()

    return jsonify({"message": f"Organization with ID {organization_id} deleted successfully."}), 200
"""