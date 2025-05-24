# src/voip_backend/app.py

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

from src.voip_backend.extensions import db, ma
from src.voip_backend.routes.register_routes import register_routes
from src.voip_backend.models import *  # Ensure all models are loaded
from src.configuration.config import Config

# Load environment variables from .env
load_dotenv()

# Create Flask app
app = Flask(__name__)
CORS(app)

# Load configuration from config.py
app.config.from_object(Config)

# Initialize database and marshmallow
db.init_app(app)
ma.init_app(app)

# Register all routes via central router
register_routes(app)

# Health check route
@app.route('/')
def home():
    return "✅ Backend API is running!"
