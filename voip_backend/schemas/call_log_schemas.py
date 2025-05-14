from extensions import ma
from marshmallow import Schema, fields, validate

class CallLogSchema(ma.Schema):
    id = fields.Int(dump_only=True)
    contact_id = fields.Int(required=True)
    status_id = fields.Int(required=True)
    call_time = fields.DateTime()
    notes = fields.Str(validate=validate.Length(max=500))
