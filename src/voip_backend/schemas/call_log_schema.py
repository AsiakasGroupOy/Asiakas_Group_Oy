from src.voip_backend.extensions import ma
from marshmallow import fields
#from src.voip_backend.schemas.contact_schema import ContactListSchema
from src.voip_backend.schemas.status_schema import StatusSchema

"""class CallLogSchema(ma.Schema):
    call_timestamp = fields.DateTime(dump_only=True)

    # Nested contact info (optional for GET)
    contact = fields.Nested(ContactListSchema(exclude=("call_logs",)), dump_only=True)

    # Nested status info (optional for GET)
    status = fields.Nested(StatusSchema(), dump_only=True)

"""
class CallLogSchema(ma.Schema):
    call_timestamp = fields.DateTime(dump_only=True)

    contact = fields.Nested(
        lambda: __import__('src.voip_backend.schemas.contact_schema', fromlist=['ContactListSchema']).ContactListSchema(exclude=("call_logs",)),
        dump_only=True
    )
status = fields.Nested(StatusSchema(), dump_only=True)