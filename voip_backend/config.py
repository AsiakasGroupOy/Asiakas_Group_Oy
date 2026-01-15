# config.py
import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()
# Development configuration:

class Config:
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = os.getenv("DB_PORT", 3306)
    DB_NAME = os.getenv("DB_NAME")

    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = os.getenv('APP_MAIL_USERNAME') 
    MAIL_PASSWORD = os.getenv('APP_MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = ('Soitto.ai', os.getenv('APP_MAIL_USERNAME'))
    MAIL_DEBUG = False

    APP_ADMIN_EMAIL = os.getenv("APP_ADMIN_EMAIL")
    APP_ADMIN_PASSWORD = os.getenv("APP_ADMIN_PASSWORD")
    APP_ADMIN_NAME = os.getenv("APP_ADMIN_NAME")

    TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
    TWILIO_TWIML_APP_SID = os.getenv("TWILIO_TWIML_APP_SID")
    TWILIO_API_KEY = os.getenv("TWILIO_API_KEY")
    TWILIO_API_SECRET = os.getenv("TWILIO_API_SECRET")

    SECRET_KEY = os.getenv("SECRET_KEY")
    ACCESS_EXPIRES = timedelta(minutes=int(os.getenv("ACCESS_EXPIRES_MIN", 15)))
    REFRESH_EXPIRES = timedelta(days=int(os.getenv("REFRESH_EXPIRES_DAYS", 1)))

    FRONTEND_URL = os.getenv("FRONTEND_URL")
   
    
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
    )
  
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DEBUG = True


class ProductionConfig(Config):
    
    DEBUG = False
    MAIL_DEBUG = False
    
    