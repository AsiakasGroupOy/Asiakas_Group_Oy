from flask import Blueprint, request, jsonify
from schemas.preview_file_schemas import PreviewFileSchema
from .contact_routes import SYSTEM_FIELDS
import pandas as pd

preview_file_bp = Blueprint('preview_file_bp', __name__)

preview_file_schema = PreviewFileSchema()

# ✅ CREATE an imported file fro preview
@preview_file_bp.route('/', methods=['POST'])
def preview_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    file_name = file.filename
    
    try:
        if file_name.endswith('.csv'):
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)
    except Exception as e:
        return jsonify({"error": f"Could not read file: {str(e)}"}), 400
    
    mappingOptions = list(SYSTEM_FIELDS.keys())
    headers = list(df.columns)
    preview_df = df.head(7).where(pd.notnull(df), None) # preview 7 first rows
    rows = preview_df.map(lambda x: None if pd.isna(x) else x).values.tolist()

    result = {
        "filename": file_name,
        "headers": headers,
        "rows": rows,
        "mappingOptions": mappingOptions
    }
    return jsonify(preview_file_schema.dump (result)), 200

  




        