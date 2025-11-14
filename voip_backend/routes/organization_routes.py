from flask import Blueprint, request, jsonify, g
from extensions import db
from models.models import Organization
from schemas.organization_schemas import OrganizationSchema, OrganizationShortSchema  # ✅ Schema import
from helpers.helpers import auth_required

organization_bp = Blueprint('organization_bp', __name__)

organization_schema = OrganizationSchema()
organizations_schema = OrganizationSchema(many=True)
organizations_short_schema = OrganizationShortSchema(many=True)

# ✅ GET all organizations (non-paginated)
@organization_bp.route('/all', methods=['GET'])
@auth_required
def get_all_organizations():
    organizations = Organization.query.filter_by(customer_id = g.customer_id).all()
    return jsonify(organizations_short_schema.dump(organizations)), 200


# ✅ CREATE a new organization IS NOT USED!
@organization_bp.route('/', methods=['POST'])
@auth_required
def create_organization():
    data = request.get_json()

    if not data.get('name'):
        return jsonify({"error": "Organization name is required."}), 400

    if Organization.query.filter_by(organization_name=data['name']).first():
        return jsonify({"error": "Organization with this name already exists."}), 400

    new_organization = Organization(
        organization_name=data['name'],
        website=data.get('website'),
    )
    db.session.add(new_organization)
    db.session.commit()

    return jsonify(organization_schema.dump(new_organization)), 201

