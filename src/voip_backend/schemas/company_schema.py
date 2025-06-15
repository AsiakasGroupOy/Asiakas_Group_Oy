from src.voip_backend.extensions import ma
from marshmallow import fields
from src.voip_backend.schemas.calling_list_schema import CallingListSchema
from src.voip_backend.schemas.contact_schema import ContactListSchema


class CompanySchema(ma.Schema):
    #id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    website = fields.Str(allow_none=True)

    # Related calling lists (many-to-many)
    calling_lists = fields.List(
        fields.Nested(CallingListSchema(exclude=("companies",))),
        dump_only=True
    )

    # Related contacts (one-to-many)
    
    contacts = fields.List(
        fields.Nested(ContactListSchema(exclude=("company",))),
        dump_only=True
    )

