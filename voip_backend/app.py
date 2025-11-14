# app.py

from flask import Flask
from extensions import db , ma, mail
from flask_cors import CORS
from routes import register_routes  # Register all blueprints here
from models.models import *  # Ensure all models are loaded
from logging_config import setup_logging
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

# Create Flask app
app = Flask(__name__)


# Load configuration from config.py
env = os.getenv("FLASK_ENV", "development")

if env == "production":
    app.config.from_object("config.ProductionConfig")
else:
    app.config.from_object('config.Config')

# Initialize database
db.init_app(app)
ma.init_app(app)
mail.init_app(app)
# Register all routes via central router
register_routes(app)
CORS(app,supports_credentials=True, origins=["http://localhost:5173"])

security_logger = setup_logging()
# Health check route
@app.route('/')
def home():
    return "✅ Backend API is running!"


# Run the app
if __name__ == "__main__":
    
    with app.app_context():
        db.create_all()  # Create database tables if they don't exist
        
        print("✅ Database tables created successfully!")
        print("\n🔍 Registered Flask routes:")
        for rule in app.url_map.iter_rules():
            print(f"{rule.methods} -> {rule.rule}")

    app.run(host="localhost", port=5000, debug=True)