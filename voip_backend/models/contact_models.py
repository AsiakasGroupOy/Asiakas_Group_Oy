from extensions import db
from datetime import datetime

# -----------------------------------------
# Organization Table
# Stores companies/organizations associated with contacts
# -----------------------------------------
class Organization(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)

    # One-to-many relationship: one organization has many contacts
    contacts = db.relationship("Contact", backref="organization", lazy=True)

# -----------------------------------------
# Calling List Table
# Represents call campaigns/projects (e.g., "Spring Campaign 2025")
# -----------------------------------------
class CallingList(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)

    # One-to-many: one calling list has many contacts
    contacts = db.relationship("Contact", backref="calling_list", lazy=True)

# -----------------------------------------
# Status Table
# Tracks the status of each contact (e.g., "Open", "Not Interested")
# -----------------------------------------
class Status(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    label = db.Column(db.String(100), nullable=False)

    # One-to-many: one status is used by many contacts
    contacts = db.relationship("Contact", backref="status", lazy=True)

# -----------------------------------------
# Contact Table
# Main table for storing individual contact information
# -----------------------------------------
class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    job_title = db.Column(db.String(100))  # Optional
    phone = db.Column(db.String(50))       # Optional
    email = db.Column(db.String(255))      # Optional
    website = db.Column(db.String(255))    # Optional
    notes = db.Column(db.Text)             # Free-form interaction notes
    additional_info = db.Column(db.Text)   # Optional extra details
    call_time = db.Column(db.DateTime)     # Next scheduled call

    # Track creation and update timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Foreign keys to connect contact to other entities
    organization_id = db.Column(db.Integer, db.ForeignKey("organization.id"), nullable=True)
    calling_list_id = db.Column(db.Integer, db.ForeignKey("calling_list.id"), nullable=True)
    status_id = db.Column(db.Integer, db.ForeignKey("status.id"), nullable=True)

    # One-to-many: one contact can have many call logs
    call_logs = db.relationship("CallLog", backref="contact", lazy=True)

# -----------------------------------------
# Call Log Table
# Logs all interactions and activity with contacts
# -----------------------------------------
class CallLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    # Each log belongs to one contact
    contact_id = db.Column(db.Integer, db.ForeignKey("contact.id"), nullable=False)

    # Description of the activity (e.g., "Left voicemail", "Call rescheduled")
    activity = db.Column(db.String(255), nullable=False)

    # Timestamp when the activity occurred (defaults to now)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
