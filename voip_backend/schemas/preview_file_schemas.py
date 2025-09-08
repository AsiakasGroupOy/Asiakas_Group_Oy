from marshmallow import Schema,fields

class PreviewFileSchema(Schema):
    file_name = fields.Str(required=True)
    headers = fields.List(fields.Str(), required=True)
    rows = fields.List(fields.List(fields.Raw()), required=True)
    mappingOptions = fields.List(fields.Str(), required=True)