from src.voip_backend.extensions import ma
from marshmallow import fields, validate

class StatusSchema(ma.Schema):
    name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=100)
    )

   