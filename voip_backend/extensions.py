# extensions.py

# Initialize Flask extensions here
# This avoids circular imports when importing db into multiple modules


from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_mail import Mail

db = SQLAlchemy()
ma = Marshmallow()
mail = Mail()

