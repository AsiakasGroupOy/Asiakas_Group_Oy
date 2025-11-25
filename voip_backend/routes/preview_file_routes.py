import math
import numpy as np
from flask import Blueprint, request, jsonify, g
from mysql.connector.abstracts import date
from schemas.preview_file_schemas import PreviewFileSchema
from .contact_routes import SYSTEM_FIELDS
import pandas as pd
import logging
from helpers.helpers import auth_required, datetime


preview_file_bp = Blueprint('preview_file_bp', __name__)

preview_file_schema = PreviewFileSchema()

logger = logging.getLogger(__name__)
security_logger = logging.getLogger("security")

MAX_FILE_SIZE = 5 * 1024 * 1024 # 5 MB

# ✅ CREATE an imported file fro preview
@preview_file_bp.route('/', methods=['POST'])
@auth_required
def preview_file():
    if g.role not in ["Admin Access" , "Manager", "App Admin"]:
        security_logger.error("Unauthorized access attempt by user to upload file: user_id=%s, customer_id=%s", g.get("user_id"),  g.get("customer_id"))
        return jsonify({"error": "Forbidden"}), 403
    
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']

    if request.content_length and request.content_length > MAX_FILE_SIZE:
        return jsonify({"error": "File is too large"}), 400
    
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
    rows = []
    for _, row in preview_df.iterrows():
        cleaned_row = [
            (
                None if value is None or pd.isna(value) else
                value.isoformat() if isinstance(value, (pd.Timestamp, datetime, date)) else
                int(value) if isinstance(value, (np.integer, np.int64)) else
                float(value) if isinstance(value, (np.floating, np.float64)) else
                value
            )
            for value in row
        ]
        rows.append(cleaned_row)
    
    result = {
        "filename": file_name,
        "headers": headers,
        "rows": rows,
        "mappingOptions": mappingOptions
    }
    
    return jsonify(preview_file_schema.dump(result)), 200

  




        