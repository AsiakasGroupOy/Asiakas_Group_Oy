# config.py

# Application configuration class
class Config:
    # Update with your actual MySQL password
    SQLALCHEMY_DATABASE_URI = "mysql+pymysql://root:2016@localhost:3306/voip_db"

    # Disable event system (saves resources unless needed)
    SQLALCHEMY_TRACK_MODIFICATIONS = False

