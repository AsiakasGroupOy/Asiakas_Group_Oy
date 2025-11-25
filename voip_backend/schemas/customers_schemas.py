from marshmallow import Schema, fields, validate

class CustomersSchema(Schema):
    customer_id = fields.Int(dump_only=True)
    customer_name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    customer_address = fields.Email(required=True, validate=validate.Length(max=100))
    assigned_number = fields.Str(validate=validate.Length(min=7, max=15))


