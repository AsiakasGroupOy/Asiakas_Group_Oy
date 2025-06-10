from extensions import ma
from marshmallow import fields
from marshmallow import validate

class ContactCallingListSchema(ma.Schema):
    concal_id = fields.Int(dump_only=True)
    contact_id = fields.Int(required=True)
    calling_list_id = fields.Int(required=True)
    note = fields.Str(validate=validate.Length(max=800),required=False)