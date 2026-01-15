# setup.py

import pymysql
import os
from flask import Flask
from extensions import db
from config import Config, ProductionConfig
from models.models import *  # Ensure all models are imported
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Step 1: Create database if it doesn't exist

def create_database():
    connection = pymysql.connect(
        host=Config.DB_HOST,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD
    )
    try:
        with connection.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {Config.DB_NAME} "
                           f"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")#Charset utf8mb4 for proper unicode support "äöå";
        connection.commit()
    finally:
        connection.close()
    print(f"✅ Database `{Config.DB_NAME}` verified/created with utf8mb4.")

# Step 2: Create Flask app and initialize tables
def create_tables():
    app = Flask(__name__)
    env = os.getenv("FLASK_ENV", "development")
    if env == "production":
        app.config.from_object(ProductionConfig)
    else:
        app.config.from_object(Config)
    db.init_app(app)

    with app.app_context():
        db.create_all()
        print("✅ All tables created successfully.")
        create_first_customer()
        create_first_user()

# Step 3: create an first customer if not exists
def create_first_customer():
    if Customer.query.filter_by(customer_name="Soitto.ai Application").first():
        print("👤 Default customer already exists.")
        return
    
    default_customer= Customer(
        customer_name= "Soitto.ai Application",
        customer_address= "Default Address")

    db.session.add(default_customer)
    db.session.commit()
            
    print(f"👤 Default customer `{default_customer.customer_name}` created.")
           

# Step 4: create an first user if not exists
def create_first_user():
    default_customer = Customer.query.filter_by(
        customer_name="Soitto.ai Application"
    ).first()

    if not default_customer:
        raise RuntimeError("Default customer does not exist")
    
    if not User.query.filter_by(
        useremail=Config.APP_ADMIN_EMAIL
    ).first():
        app_admin= User(
                username=Config.APP_ADMIN_NAME,
                useremail=Config.APP_ADMIN_EMAIL,
                role= UserRoles.APP_ADMIN,
                customer_id=default_customer.customer_id
            )
        app_admin.set_password(Config.APP_ADMIN_PASSWORD)
        db.session.add(app_admin)
        print(f"👤 App Admin `{app_admin.useremail}` created.")
    else:
        print("👤 App Admin already exists.")
    db.session.commit()    

if __name__ == '__main__':
    print("🚀 Running backend setup in {os.getenv('FLASK_ENV', 'development')} mode...")
    create_database()
    create_tables()
  
    print("🎉 Setup complete.")
   
