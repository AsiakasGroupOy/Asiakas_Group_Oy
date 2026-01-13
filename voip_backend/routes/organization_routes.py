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



