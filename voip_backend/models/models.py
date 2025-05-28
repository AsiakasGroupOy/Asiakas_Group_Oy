from extensions import db
from datetime import datetime

# -----------------------------------------
# ORGANIZATION MODEL
# -----------------------------------------
class Organization(db.Model):
    __tablename__ = "organization"

    organization_id = db.Column(db.Integer, primary_key=True)
    organization_name = db.Column(db.String(255), nullable=False, unique=True)
    website = db.Column(db.String(255))
    
    # Relationships
    contacts = db.relationship('ContactList', backref='organization', lazy=True)

    def serialize(self):
        return {
            'organization_id': self.organization_id,
            'organization_name': self.organization_name,
            'website': self.website,
          
        }

# -----------------------------------------
# CALLING LIST MODEL
# -----------------------------------------
class CallingList(db.Model):
    __tablename__ = "calling_list"

    calling_list_id = db.Column(db.Integer, primary_key=True)
    calling_list_name = db.Column(db.String(255), nullable=False, unique=True)
    
    # Relationships
    contact_calling_lists = db.relationship('ContactCallingList', back_populates='calling_list', cascade="all, delete-orphan")
    contacts = db.relationship('ContactList',secondary='contact_calling_list', back_populates='calling_lists'  )

    def serialize(self):
        return {
            'calling_list_id': self.calling_list_id,
            'calling_list_name': self.calling_list_name,
        }

# -----------------------------------------
# STATUS MODEL
# -----------------------------------------
class Status(db.Model):
    __tablename__ = "status"

    status_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)

    # Relationships
    call_logs = db.relationship('CallLog', backref='status', lazy=True)

    def serialize(self):
        return {
            'status_id': self.status_id,
            'name': self.status_name,
        }

# -----------------------------------------
# CONTACT LIST MODEL
# -----------------------------------------
class ContactList(db.Model):
    __tablename__ = "contact_list"

    contact_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    job_title = db.Column(db.String(100))
    phone = db.Column(db.String(50))
    email = db.Column(db.String(255), unique=True)
    note = db.Column(db.Text)
    organization_id = db.Column(db.Integer, db.ForeignKey('organization.organization_id', ondelete="SET NULL"), nullable=True)
    calling_list_id = db.Column(db.Integer, db.ForeignKey('calling_list.calling_list_id', ondelete="SET NULL"), nullable=True)
    
    # Relationships
    call_logs = db.relationship('CallLog', backref='contact', lazy=True, cascade="all, delete")
    contact_calling_lists = db.relationship('ContactCallingList', back_populates='contact', cascade="all, delete-orphan")
    calling_lists = db.relationship('CallingList', secondary='contact_calling_list', back_populates='contacts' )

    def serialize(self):
        return {
            'contact_id': self.contact_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'job_title': self.job_title,
            'phone': self.phone,
            'email': self.email,
            'note': self.note,
            'organization_id': self.organization_id,
            'calling_list_id': self.calling_list_id,
        }

# -----------------------------------------
# CALL LOG MODEL
# -----------------------------------------
class CallLog(db.Model):
    __tablename__ = "call_log"

    call_id = db.Column(db.Integer, primary_key=True)
    contact_id = db.Column(db.Integer, db.ForeignKey('contact_list.contact_id', ondelete="CASCADE"), nullable=False)
    status_id = db.Column(db.Integer, db.ForeignKey('status.status_id'), nullable=True)  # ✅ status_id is optional
    call_timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize(self):
        return {
            'call_id': self.call_id,
            'contact_id': self.contact_id,
            'status_id': self.status_id,
            'call_timestamp': self.call_timestamp.isoformat() if self.call_timestamp else None,
        }
# -----------------------------------------
# CONTACT CALLING LIST MODEL/Tatiana
# -----------------------------------------    
class ContactCallingList(db.Model):
    __tablename__ = "contact_calling_list"

    concal_id = db.Column(db.Integer, primary_key=True)
    contact_id = db.Column(db.Integer, db.ForeignKey('contact_list.contact_id', ondelete="CASCADE"), nullable=False)
    calling_list_id = db.Column(db.Integer, db.ForeignKey('calling_list.calling_list_id', ondelete="CASCADE"), nullable=False)

    # Optional: relationships for easier access
    contact = db.relationship('ContactList', back_populates='contact_calling_lists')
    calling_list = db.relationship('CallingList', back_populates='contact_calling_lists')