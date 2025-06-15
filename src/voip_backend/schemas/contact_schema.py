from src.voip_backend.extensions import ma
from marshmallow import fields
from src.voip_backend.schemas.company_schema import CompanySchema
#from src.voip_backend.schemas.calling_list_schema import CallingListSchema

class ContactListSchema(ma.Schema):
    first_name = fields.Str(required=True)
    last_name = fields.Str(required=True)
    job_title = fields.Str(allow_none=True)
    phone = fields.Str(allow_none=True)
    email = fields.Email(allow_none=True)
    note = fields.Str(allow_none=True)

    # Linked company (one-to-many)
    company = fields.Nested(CompanySchema(exclude=("contacts",)), dump_only=True)

    # Linked calling list (one-to-many)
    calling_list = fields.Nested(CallingListSchema(exclude=("contacts",)), dump_only=True)

    # Optionally include call logs later when schema exists
    # call_logs = fields.List(fields.Nested(CallLogSchema(exclude=("contact",))), dump_only=True)

