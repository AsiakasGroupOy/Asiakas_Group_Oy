from marshmallow import Schema, fields, validate

class OrganizationSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    address = fields.Str(validate=validate.Length(max=200))
    phone = fields.Str(validate=validate.Length(min=7, max=20))
    email = fields.Email()
