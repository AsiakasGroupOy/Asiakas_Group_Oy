from marshmallow import Schema, fields,validate

class InvitationSchema(Schema):
    invitation_id = fields.Int(dump_only=True)
    invitation_email = fields.Email(required=True, validate=validate.Length(max=100))
    role = fields.Method("get_role_value") # Custom method to get enum value
    expires_at = fields.DateTime(required=True)
    used = fields.Bool(required=True)
    

    def get_role_value(self, obj):
        return obj.role.value