from extensions import db
from datetime import datetime
import enum
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
    contact_calling_lists = db.relationship('ContactCallingList', back_populates='calling_list')
    

    def serialize(self):
        return {
            'calling_list_id': self.calling_list_id,
            'calling_list_name': self.calling_list_name,
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
    email = db.Column(db.String(255))
    organization_id = db.Column(db.Integer, db.ForeignKey('organization.organization_id', ondelete="SET NULL"), nullable=True)
   
    
    # Relationships
    contact_calling_lists = db.relationship('ContactCallingList', back_populates='contact')
    

    def serialize(self):
        return {
            'contact_id': self.contact_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'job_title': self.job_title,
            'phone': self.phone,
            'email': self.email,
            'organization_id': self.organization_id,
           
        }
# -----------------------------------------
# ENUM FOR CALL STATUS IN CALL LOG
# -----------------------------------------

class CallStatus(enum.Enum):
    MEETING_SCHEDULED = "Meeting Scheduled"
    OPEN = "Open"
    NOT_INTERESTED = "Not Interested"
    SCHEDULED_CALL = "Scheduled Call"

# -----------------------------------------
# CALL LOG MODEL
# -----------------------------------------
class CallLog(db.Model):
    __tablename__ = "call_log"

    call_id = db.Column(db.Integer, primary_key=True)
    concal_id = db.Column(db.Integer, db.ForeignKey('contact_calling_list.concal_id', ondelete="CASCADE"), nullable=False)
    status = db.Column(db.Enum(CallStatus), nullable=False)
    call_timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    contact_calling_list = db.relationship('ContactCallingList', back_populates='call_logs',  passive_deletes=True)

    def serialize(self):
        return {
            'call_id': self.call_id,
            'concal_id': self.concal_id,
            'status': self.status.value,
            'call_timestamp': self.call_timestamp.isoformat() if self.call_timestamp else None,
        }
# -----------------------------------------
# CONTACT CALLING LIST MODEL
# -----------------------------------------
    
class ContactCallingList(db.Model):
    __tablename__ = "contact_calling_list"

    concal_id = db.Column(db.Integer, primary_key=True)
    note = db.Column(db.String(255))
    contact_id = db.Column(db.Integer, db.ForeignKey('contact_list.contact_id'), nullable=False)
    calling_list_id = db.Column(db.Integer, db.ForeignKey('calling_list.calling_list_id'), nullable=False)
    
    __table_args__ = (
            db.UniqueConstraint('contact_id', 'calling_list_id', name='uq_contact_calling_list'),
        )
    
    # Optional: relationships for easier access
    contact = db.relationship('ContactList', back_populates='contact_calling_lists')
    calling_list = db.relationship('CallingList', back_populates='contact_calling_lists')
    call_logs = db.relationship('CallLog', back_populates='contact_calling_list', cascade="all, delete-orphan", passive_deletes=True)