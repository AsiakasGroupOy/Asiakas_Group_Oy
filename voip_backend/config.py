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
    MAIL_DEFAULT_SENDER = ('Call Management Application', os.getenv('APP_MAIL_USERNAME'))

    ADMIN_EMAIL= os.getenv("ADEMAIL")
    ADMIN_PASSWORD = os.getenv("ADPASSWORD")
    ADMIN_NAME = os.getenv("ADNAME")

    MANAGER_EMAIL= os.getenv("MEMAIL")
    MANAGER_PASSWORD = os.getenv("MPASSWORD")
    MANAGER_NAME = os.getenv("MNAME")

    USER_EMAIL= os.getenv("UEMAIL")
    USER_PASSWORD = os.getenv("UPASSWORD")
    USER_NAME = os.getenv("UNAME")

    ADMIN_EMAIL2= os.getenv("ADEMAIL2")
    ADMIN_PASSWORD2 = os.getenv("ADPASSWORD2")
    ADMIN_NAME2 = os.getenv("ADNAME2")

    MANAGER_EMAIL2= os.getenv("MEMAIL2")
    MANAGER_PASSWORD2 = os.getenv("MPASSWORD2")
    MANAGER_NAME2 = os.getenv("MNAME2")

    USER_EMAIL2= os.getenv("UEMAIL2")
    USER_PASSWORD2 = os.getenv("UPASSWORD2")
    USER_NAME2 = os.getenv("UNAME2")

    SECRET_KEY = os.getenv("SECRET_KEY")
    ACCESS_EXPIRES = timedelta(minutes=int(os.getenv("ACCESS_EXPIRES_MIN", 15)))
    REFRESH_EXPIRES = timedelta(days=int(os.getenv("REFRESH_EXPIRES_DAYS", 7)))

    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DEBUG = True


class ProductionConfig(Config):
    
    DEBUG = False
#   SQLALCHEMY_DATABASE_URI = os.getenv("PROD_DB_URI")