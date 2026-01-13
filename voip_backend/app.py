# app.py

from flask import Flask
from extensions import db , ma, mail
from flask_cors import CORS
from flask_migrate import Migrate
from routes import register_routes  # Register all blueprints here
from models.models import *  # Ensure all models are loaded
from logging_config import setup_logging
from middleware.request_logging import init_request_logging
from middleware.error_handler import register_global_error_handler
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


# Setup logging
security_logger,twilio_logger,audit_logger, root_logger = setup_logging()

# Initialize request logging middleware
init_request_logging(app)
register_global_error_handler(app)

# Register all routes via central router
register_routes(app)
allowed_origins = [app.config.get('FRONTEND_URL'), app.config.get('TEMP_TWILIO_HOST')]
CORS(app,supports_credentials=True, origins=allowed_origins)

# Initialize Flask-Migrate
migrate = Migrate(app, db)

# Health check route
@app.route('/')
def home():
    return "✅ Backend API is running!"


# Run the app
if __name__ == "__main__":
    
    with app.app_context():
       # db.create_all()  # Create database tables if they don't exist
        
        print("✅ Database tables created successfully!")
        print("\n🔍 Registered Flask routes:")
        for rule in app.url_map.iter_rules():
            print(f"{rule.methods} -> {rule.rule}")
         

    app.run(host="localhost", port=5000, debug=True)