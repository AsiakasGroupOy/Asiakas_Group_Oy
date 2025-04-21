# extensions.py

# Initialize Flask extensions here
# This avoids circular imports when importing db into multiple modules

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

