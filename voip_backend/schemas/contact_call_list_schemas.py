from extensions import ma
from marshmallow import Schema, fields

class ContactCallListSchema(ma.Schema):
    concal_id = fields.Int(dump_only=True)
    contact_id = fields.Int(required=True)
    calling_list_id = fields.Int(required=True)
   