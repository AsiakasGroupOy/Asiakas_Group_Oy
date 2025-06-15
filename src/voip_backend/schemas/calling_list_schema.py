from src.voip_backend.extensions import ma
from marshmallow import fields
from src.voip_backend.schemas.company_schema import CompanySchema
from src.voip_backend.schemas.contact_schema import ContactListSchema

class CallingListSchema(ma.Schema):
    name = fields.Str(required=True)

    # Optionally show related companies (excluding their nested lists)
    companies = fields.List(
        fields.Nested(CompanySchema(exclude=("calling_lists",))),
        dump_only=True
    )

    # Optionally show contacts when ContactListSchema is available
    contacts = fields.List(
        fields.Nested(ContactListSchema(exclude=("calling_lists",))),
        dump_only=True
    )

