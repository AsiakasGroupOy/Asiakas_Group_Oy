from extensions import ma
from marshmallow import Schema, fields, validate

class CallingListSchema(ma.Schema):
    calling_list_id = fields.Int(dump_only=True)
    calling_list_name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    description = fields.Str(validate=validate.Length(max=200))

