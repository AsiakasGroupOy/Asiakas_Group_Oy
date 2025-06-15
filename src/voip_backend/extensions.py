# extensions.py

# Initialize Flask extensions here
# This avoids circular imports when importing db into multiple modules


from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow

db = SQLAlchemy()
ma = Marshmallow()
