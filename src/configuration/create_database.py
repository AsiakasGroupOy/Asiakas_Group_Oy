# src/configuration/create_db.py

import pymysql
from dotenv import load_dotenv
import os
from src.configuration.config import Config

# Load .env
load_dotenv()

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

if __name__ == '__main__':
    print("🚀 Creating database...")
    create_database()
