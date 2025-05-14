

import sys
import os

# Add project root directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from extensions import db
from models.models import Status
from app import app

def preload_statuses():
    statuses = ["Meeting Scheduled", "Open", "Not Interested", "Scheduled Call"]

    with app.app_context():
        for status_name in statuses:
            existing_status = Status.query.filter_by(name=status_name).first()
            if not existing_status:
                new_status = Status(name=status_name)
                db.session.add(new_status)
        db.session.commit()
        print("✅ Statuses inserted successfully!")

if __name__ == "__main__":
    preload_statuses()
