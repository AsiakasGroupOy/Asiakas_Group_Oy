from src.voip_backend.extensions import ma
from marshmallow import Schema, fields, validate

class ContactSchema(ma.Schema):
    contact_id = fields.Int(dump_only=True)
    first_name = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    last_name = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    email = fields.Email(required=True)
    job_title = fields.Str(validate=validate.Length(max=100))
    phone = fields.Str(validate=validate.Length(min=7, max=20))
    note = fields.Str(validate=validate.Length(max=500))
    organization_id = fields.Int()
    calling_list_id = fields.Int()

