# setup.py

import pymysql
from flask import Flask
from extensions import db
from config import Config
from models.models import *  # Ensure all models are imported
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Step 0: Drop existing database if needed
def drop_database():
    connection = pymysql.connect(
        host=Config.DB_HOST,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD
    )
    with connection.cursor() as cursor:
        cursor.execute(f"DROP DATABASE IF EXISTS {Config.DB_NAME}")
    connection.close()
    print(f"🗑️  Database `{Config.DB_NAME}` dropped.")

# Step 1: Create database if it doesn't exist
def create_database():
    connection = pymysql.connect(
        host=Config.DB_HOST,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD
    )
    with connection.cursor() as cursor:
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {Config.DB_NAME}")
    connection.close()
    print(f"✅ Database `{Config.DB_NAME}` created or already exists.")

# Step 2: Create Flask app and initialize tables
def create_tables():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)

    with app.app_context():
        db.create_all()
        print("✅ All tables created successfully.")

      

if __name__ == '__main__':
    print("🚀 Running backend setup...")
    drop_database()
    create_database()
    create_tables()
  
    print("🎉 Setup complete. You can now run the Flask app using `python app.py`.")
   
