from flask import Flask
from flask_cors import CORS
from config import Config            # Import app configuration (like DB settings)
from extensions import db            # Our SQLAlchemy instance
from models import Contact, Organization, Status, CallingList, CallLog  # Models we want to initialize
from routes.contact_routes import contact_bp  # Import Blueprint for contact routes

# Factory function to create and configure the Flask app
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)  # Load config from config.py

    db.init_app(app)     # Bind SQLAlchemy to this app
    CORS(app)            # Enable CORS for all routes

    app.register_blueprint(contact_bp)  # Register contact-related routes

    # Create tables if they don't exist (only happens once at start)
    with app.app_context():
        db.create_all()

    return app

# Start the development server if this file is run directly
if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
