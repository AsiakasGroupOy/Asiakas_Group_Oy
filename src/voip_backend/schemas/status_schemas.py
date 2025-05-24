from src.voip_backend.extensions import ma
from marshmallow import Schema, fields, validate

class StatusSchema(ma.Schema):
    status_id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=2, max=50))
    description = fields.Str(validate=validate.Length(max=200))
    created_at = fields.DateTime()
    updated_at = fields.DateTime()