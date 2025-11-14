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
        create_first_customer()
        create_first_users()

# Step 3: create an first customer if not exists
def create_first_customer():
   
    
            first_customer = Customer(
                customer_name="First Customer",
                customer_email="tanjaljubavskaja@gmail.com")
            second_customer = Customer(
                customer_name="Second Customer",
                customer_email="tatiana.ljubavskaja.profit@gmail.com")
            
            db.session.add(first_customer)  
            db.session.add(second_customer)
            db.session.commit()

            print(f"👤 First customer `{first_customer.customer_name}` created.")
            print(f"👤 Second customer `{second_customer.customer_name}` created.")

# Step 4: create an first user if not exists
def create_first_users():
    users = [
        {"username": Config.ADMIN_NAME, "useremail":Config.ADMIN_EMAIL,"password": Config.ADMIN_PASSWORD, "role": UserRoles.APP_ADMIN},
        {"username": Config.MANAGER_NAME, "useremail":Config.MANAGER_EMAIL,"password": Config.MANAGER_PASSWORD, "role": UserRoles.CALL_MANAGER},
        {"username": Config.USER_NAME,"useremail": Config.USER_EMAIL,"password": Config.USER_PASSWORD, "role": UserRoles.CALL_USER}
    ] 
    users_second = [
        {"username": Config.ADMIN_NAME2, "useremail":Config.ADMIN_EMAIL2,"password": Config.ADMIN_PASSWORD2, "role": UserRoles.APP_ADMIN},
        {"username": Config.MANAGER_NAME2, "useremail":Config.MANAGER_EMAIL2,"password": Config.MANAGER_PASSWORD2, "role": UserRoles.CALL_MANAGER},
        {"username": Config.USER_NAME2,"useremail": Config.USER_EMAIL2,"password": Config.USER_PASSWORD2, "role": UserRoles.CALL_USER}
    ] 

    for data in users: 
        if not User.query.filter_by(useremail=data["useremail"]).first():
            user = User(
                username=data["username"],
                useremail=data["useremail"],
                role=data["role"],
                customer_id=Customer.query.filter_by(customer_name = "First Customer").first().customer_id
            )
            user.set_password(data["password"])

            db.session.add(user)
            print(f"👤 User `{data["useremail"]}` created.")
        else:
            print(f"👤 User `{data["useremail"]}` already exists.")

    for data in users_second: 
        if not User.query.filter_by(useremail=data["useremail"]).first():
            user = User(
                username=data["username"],
                useremail=data["useremail"],
                role=data["role"],
                customer_id=Customer.query.filter_by(customer_name = "Second Customer").first().customer_id
            )
            user.set_password(data["password"])

            db.session.add(user)
            print(f"👤 User `{data["useremail"]}` created.")
        else:
            print(f"👤 User `{data["useremail"]}` already exists.")        
            
    db.session.commit()
    print("✅ Default users created successfully")



if __name__ == '__main__':
    print("🚀 Running backend setup...")
    drop_database()
    create_database()
    create_tables()
  
    print("🎉 Setup complete. You can now run the Flask app using `python app.py`.")
   
