from src.voip_backend.extensions import db
from src.voip_backend.models import Status
from flask import current_app

def preload_statuses():
    statuses = ["Meeting Scheduled", "Open", "Not Interested", "Scheduled Call"]

    with current_app.app_context():
        for name in statuses:
            if not Status.query.filter_by(name=name).first():
                db.session.add(Status(name=name))
        db.session.commit()
        print("✅ Predefined statuses inserted successfully!")

if __name__ == "__main__":
    from src.voip_backend.app import app
    with app.app_context():
        preload_statuses()
