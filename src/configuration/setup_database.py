# src/configuration/setup_database.py

from flask import Flask
from dotenv import load_dotenv
import os

from src.configuration.config import Config
from src.voip_backend.extensions import db
from src.voip_backend.models.models import *  # Includes Status
from src.voip_backend.scripts.preload_statuses import preload_statuses


load_dotenv()

def create_tables():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)

    with app.app_context():
        db.create_all()
        print("✅ All tables created successfully.")
        preload_statuses()
        print("🎉 Predefined statuses inserted.")

if __name__ == '__main__':
    print("🚀 Setting up database tables...")
    create_tables()
