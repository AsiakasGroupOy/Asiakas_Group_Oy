from flask import Blueprint, request, jsonify, g
from schemas.preview_file_schemas import PreviewFileSchema
from .contact_routes import SYSTEM_FIELDS
import pandas as pd
import logging
from helpers.helpers import auth_required


preview_file_bp = Blueprint('preview_file_bp', __name__)

preview_file_schema = PreviewFileSchema()

logger = logging.getLogger(__name__)
security_logger = logging.getLogger("security")

# ✅ CREATE an imported file fro preview
@preview_file_bp.route('/', methods=['POST'])
@auth_required
def preview_file():
    if g.role != "Admin Access":
        security_logger.error("Unauthorized access attempt by user to upload file: user_id=%s, customer_id=%s", g.get("user_id"),  g.get("customer_id"))
        return jsonify({"error": "Forbidden"}), 403
    
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

  




        