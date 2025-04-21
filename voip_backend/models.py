from extensions import db
from datetime import datetime

class Organization(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    contacts = db.relationship("Contact", backref="organization", lazy=True)

class CallingList(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    contacts = db.relationship("Contact", backref="calling_list", lazy=True)

class Status(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    label = db.Column(db.String(100), nullable=False)
    contacts = db.relationship("Contact", backref="status", lazy=True)

class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    job_title = db.Column(db.String(100))
    phone = db.Column(db.String(50))
    email = db.Column(db.String(255))
    website = db.Column(db.String(255))
    notes = db.Column(db.Text)
    additional_info = db.Column(db.Text)
    call_time = db.Column(db.DateTime)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organization_id = db.Column(db.Integer, db.ForeignKey("organization.id"), nullable=True)
    calling_list_id = db.Column(db.Integer, db.ForeignKey("calling_list.id"), nullable=True)
    status_id = db.Column(db.Integer, db.ForeignKey("status.id"), nullable=True)

    call_logs = db.relationship("CallLog", backref="contact", lazy=True)

class CallLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    contact_id = db.Column(db.Integer, db.ForeignKey("contact.id"), nullable=False)
    activity = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
