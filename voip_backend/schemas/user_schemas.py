from marshmallow import Schema, fields, validate

class UserLogInSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=30))
    password = fields.Str(required=True, validate=validate.Length(min=9, max=15), load_only=True)


class UserRoleSchema(Schema):
    user_id = fields.Int(dump_only=True)
    username = fields.Str(required=True, validate=validate.Length(min=3, max=30))
    useremail = fields.Email(required=True, validate=validate.Length(max=100))
    role = fields.Method("get_role_value") # Custom method to get enum value

    def get_role_value(self, obj):
        return obj.role.value

class UserRegisterSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=30))
    password = fields.Str(required=True, validate=validate.Length(min=9, max=15), load_only=True)
    useremail = fields.Email(required=True, validate=validate.Length(max=100))
    role = fields.Str(required=True)    