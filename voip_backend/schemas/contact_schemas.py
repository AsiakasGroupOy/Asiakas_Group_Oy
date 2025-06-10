from marshmallow import Schema, fields, validate

class ContactSchema(Schema):
    contact_id = fields.Int(dump_only=True)
    first_name = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    last_name = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    email = fields.Str(required=False)
    job_title = fields.Str(required=False)
    phone = fields.Str(validate=validate.Length(min=7, max=20))
    organization_id = fields.Int(required=True)
    

