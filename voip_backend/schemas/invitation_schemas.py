from marshmallow import Schema, fields,validate

class InvitationSchema(Schema):
    invitation_id = fields.Int(dump_only=True)
    invitation_email = fields.Email(required=True, validate=validate.Length(max=100))
    role = fields.Method("get_role_value") # Custom method to get enum value
    expires_at = fields.DateTime(required=True,format='%Y-%m-%dT%H:%M:%SZ')
    used = fields.Bool(required=True)

    def get_role_value(self, obj):
            return obj.role.value 

class InvitationCustomersSchema(Schema): 
    invitation_id = fields.Int(dump_only=True)
    invitation_email = fields.Email(required=True, validate=validate.Length(max=100))
    role = fields.Method("get_role_value") # Custom method to get enum value
    expires_at = fields.DateTime(required=True,format='%Y-%m-%dT%H:%M:%SZ')
    used = fields.Bool(required=True)  
    created_by = fields.Int(required=True)  
    customer_name = fields.Method("get_customer_name")
    customer_address = fields.Method("get_customer_address")
    
    def get_role_value(self, obj):
            return obj.role.value
    
    def get_customer_name(self, obj):
            return obj.customer.customer_name if obj.customer else None

    def get_customer_address(self, obj):
            return obj.customer.customer_address if obj.customer else None