from marshmallow import Schema,fields

class CallLogSchema(Schema):
    call_id = fields.Int(dump_only=True)
    status = fields.Method("get_status_value", required=True)
    concal_id = fields.Int(required=True)
    call_timestamp = fields.DateTime(dump_only=True, format='iso')
    scheduled_call = fields.DateTime(allow_none=True)
  
    def get_status_value(self, obj):
        return obj.status.value

    