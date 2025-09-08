from marshmallow import Schema, fields, validate

class OrganizationSchema(Schema):
    organization_id = fields.Int(dump_only=True)
    organization_name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    website = fields.Str()

class OrganizationShortSchema(Schema):
    organization_id = fields.Int()
    organization_name = fields.Str()