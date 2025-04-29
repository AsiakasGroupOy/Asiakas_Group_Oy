from marshmallow import Schema, fields, validate

class StatusSchema(Schema):
    id = fields.Int(dump_only=True)
    status_name = fields.Str(required=True, validate=validate.Length(min=2, max=50))
    description = fields.Str(validate=validate.Length(max=200))
