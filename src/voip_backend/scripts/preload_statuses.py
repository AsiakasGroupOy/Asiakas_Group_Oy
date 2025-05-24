

# src/scripts/preload_statuses.py

from src.voip_backend.app import app
from src.voip_backend.extensions import db
from src.voip_backend.models.models import Status

def preload_statuses():
    statuses = ["Meeting Scheduled", "Open", "Not Interested", "Scheduled Call"]

    with app.app_context():
        for status_name in statuses:
            existing_status = Status.query.filter_by(name=status_name).first()
            if not existing_status:
                db.session.add(Status(name=status_name))
        db.session.commit()
        print("✅ Statuses inserted successfully!")

if __name__ == "__main__":
    preload_statuses()
