from marshmallow import Schema, fields, validate

class CallBacksSchema(Schema):
    twilio_call_id = fields.Int(dump_only=True)
    call_sid = fields.Str(dump_only=True)
    user_name = fields.Method("get_user_name", dump_only=True)
    customer_name = fields.Method("get_customer_name", dump_only=True)
  
    from_number = fields.Str(required=True, validate=validate.Length(min=10, max=20))
    to_number = fields.Str(required=True, validate=validate.Length(min=10, max=20))
    direction = fields.Str(required=True, validate=validate.OneOf(['inbound', 'outbound']))
    status = fields.Str(required=True)
    started_at = fields.DateTime(allow_none=True)
    ended_at = fields.DateTime(allow_none=True)
    recording_duration = fields.Int(allow_none=True)
    recording_sid = fields.Str(allow_none=True)
    calling_list_name = fields.Str(allow_none=True)
    contact_name = fields.Str(allow_none=True)
    organization_name = fields.Str(allow_none=True)

    def get_user_name(self, obj):
        return obj.user.username if obj.user else None
    def get_customer_name(self, obj):
        return obj.customer.customer_name if obj.customer else None
    
 