from marshmallow import Schema,fields

class CallLogSchema(Schema):
    call_id = fields.Int(dump_only=True)
    status = fields.Str(required=True)
    concal_id = fields.Int(required=True)
    call_timestamp = fields.DateTime(dump_only=True)
   
