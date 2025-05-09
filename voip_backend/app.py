# app.py

from flask import Flask
from extensions import db
from flask_cors import CORS
from routes import register_routes
from models.models import *  # ✅ Import all models here!

# Create Flask app
app = Flask(__name__)
CORS(app)

# Load configuration
app.config.from_object('config.Config')

# Initialize database extension
db.init_app(app)

# Create tables inside app context
#with app.app_context():
    #db.create_all()
    #print("✅ Tables created!")

# Routes registration (temporarily commented)
register_routes(app)

# Test home route
@app.route('/')
def home():
    return "Backend API is running!"

if __name__ == "__main__":
    app.run(debug=True)
