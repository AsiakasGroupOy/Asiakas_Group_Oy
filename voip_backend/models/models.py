import time
from extensions import db
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
import enum
# -----------------------------------------
# ORGANIZATION MODEL
# -----------------------------------------
class Organization(db.Model):
    __tablename__ = "organization"

    organization_id = db.Column(db.Integer, primary_key=True)
    organization_name = db.Column(db.String(255), nullable=False)
    website = db.Column(db.String(255))
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.customer_id', ondelete="CASCADE"), nullable=False)

    __table_args__ = (
        db.Index('idx_org_name_customer', 'customer_id', 'organization_name'),
    )
    # Relationships
    contacts = db.relationship('ContactList', back_populates ='organization', lazy=True)
    customer = db.relationship('Customer', back_populates='organizations')
    

# -----------------------------------------
# CALLING LIST MODEL
# -----------------------------------------
class CallingList(db.Model):
    __tablename__ = "calling_list"

    calling_list_id = db.Column(db.Integer, primary_key=True)
    calling_list_name = db.Column(db.String(255), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.customer_id', ondelete="CASCADE"), nullable=False)

    # Relationships
    contact_calling_lists = db.relationship('ContactCallingList', back_populates='calling_list')
    customer = db.relationship('Customer', back_populates='calling_lists')
    
    



# -----------------------------------------
# CONTACT LIST MODEL
# -----------------------------------------
class ContactList(db.Model):
    __tablename__ = "contact_list"

    contact_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    job_title = db.Column(db.String(100))
    phone = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(255))
    organization_id = db.Column(db.Integer, db.ForeignKey('organization.organization_id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.customer_id', ondelete="CASCADE"), nullable=False)

    __table_args__ = ( db.Index('idx_contacts_customer_id', 'customer_id'),)

    # Relationships
    contact_calling_lists = db.relationship('ContactCallingList', back_populates='contact')
    customer = db.relationship('Customer',back_populates='contacts')
    organization = db.relationship('Organization', back_populates='contacts')
      
    

# -----------------------------------------
# ENUM FOR CALL STATUS IN CALL LOG
# -----------------------------------------

class CallStatus(enum.Enum):
    MEETING_SCHEDULED = "meetingScheduled"
    OPEN = "open"
    NOT_INTERESTED = "notInterested"
    SCHEDULED_CALL = "scheduledCall"
    NO_ANSWER = "noAnswer"

# -----------------------------------------
# CALL LOG MODEL
# -----------------------------------------
class CallLog(db.Model):
    __tablename__ = "call_log"

    call_id = db.Column(db.Integer, primary_key=True)
    concal_id = db.Column(db.Integer, db.ForeignKey('contact_calling_list.concal_id', ondelete="CASCADE"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=True)
    status = db.Column(db.Enum(CallStatus), nullable=False)
    scheduled_call = db.Column(db.DateTime(timezone=True), nullable=True)
    call_timestamp = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    
    __table_args__ = (db.Index('idx_timestamp', 'call_timestamp'),)
    
    # Relationships
    contact_calling_list = db.relationship('ContactCallingList', back_populates='call_logs',  passive_deletes=True)
    user = db.relationship('User', back_populates='call_logs')
# -----------------------------------------
# CONTACT CALLING LIST MODEL
# -----------------------------------------
    
class ContactCallingList(db.Model):
    __tablename__ = "contact_calling_list"

    concal_id = db.Column(db.Integer, primary_key=True)
    note = db.Column(db.Text)
    contact_id = db.Column(db.Integer, db.ForeignKey('contact_list.contact_id'), nullable=False)
    calling_list_id = db.Column(db.Integer, db.ForeignKey('calling_list.calling_list_id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.customer_id', ondelete="CASCADE"), nullable=False)

    __table_args__ = (
            db.UniqueConstraint('contact_id', 'calling_list_id', 'customer_id', name='uq_cust_cont_call_list'),
            db.Index('idx_concal_customer_calling_list', 'customer_id', 'calling_list_id'),
        )
    
     # Relationships

    contact = db.relationship('ContactList', back_populates='contact_calling_lists')
    calling_list = db.relationship('CallingList', back_populates='contact_calling_lists')
    call_logs = db.relationship('CallLog', back_populates='contact_calling_list', cascade="all, delete-orphan", passive_deletes=True)
    customer = db.relationship('Customer',back_populates='contact_calling_lists')

# -----------------------------------------
# ENUM FOR USER ROLES
# -----------------------------------------

class UserRoles(enum.Enum):
   CALL_MANAGER = "Manager"
   CALL_USER = "User"
   CALL_ADMIN = "Admin Access"
   APP_ADMIN = "App Admin"

# -----------------------------------------
# USER MODEL
# -----------------------------------------

class User(db.Model):
    __tablename__ = "user"

    user_id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.customer_id', ondelete="CASCADE"), nullable=False)
    username = db.Column(db.String(50), nullable=False)
    useremail = db.Column(db.String(100), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum(UserRoles), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        db.UniqueConstraint("customer_id", "useremail", name="uq_user_email_per_customer"),
        db.Index('idx_user_customer', 'customer_id'),
    )
     # Relationships
    twilio_calls = db.relationship('TwilioCall', back_populates='user', lazy=True)
    twilio_agent_status = db.relationship('TwilioAgentStatus', back_populates='user', uselist=False)
    customer = db.relationship('Customer',back_populates='users')
    created_invitations = db.relationship('Invitation', back_populates='created_by_user', lazy=True)
    call_logs = db.relationship('CallLog', back_populates='user')

    def set_password(self, userpassword):
        self.password_hash = generate_password_hash(userpassword)

    def check_password(self, userpassword):
        return check_password_hash(self.password_hash, userpassword)

# -----------------------------------------
# CUSTOMER MODEL
# -----------------------------------------
class Customer(db.Model):
    __tablename__ = "customer"

    customer_id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(255), nullable=False)
    customer_address = db.Column(db.String(100), unique=True, nullable=False)
    assigned_number = db.Column(db.String(20), unique=True, nullable=True, default=None)
    assigned_number_1 = db.Column(db.String(20), unique=True, nullable=True, default=None)
    assigned_number_2 = db.Column(db.String(20), unique=True, nullable=True, default=None)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships 
    users = db.relationship('User', back_populates='customer', lazy=True, cascade="all, delete-orphan", passive_deletes=True)
    organizations = db.relationship('Organization', back_populates='customer', lazy=True, cascade="all, delete-orphan", passive_deletes=True)
    calling_lists = db.relationship('CallingList', back_populates='customer', lazy=True, cascade="all, delete-orphan", passive_deletes=True)
    contacts = db.relationship('ContactList', back_populates='customer', lazy=True, cascade="all, delete-orphan", passive_deletes=True)
    contact_calling_lists = db.relationship('ContactCallingList', back_populates='customer', lazy=True, cascade="all, delete-orphan", passive_deletes=True)
    invitations = db.relationship('Invitation', back_populates='customer', lazy=True, cascade="all, delete-orphan", passive_deletes=True)
    twilio_calls = db.relationship('TwilioCall',back_populates='customer',lazy=True,cascade="all, delete-orphan", passive_deletes=True)
    

# -----------------------------------------
# INVITATION MODEL
# -----------------------------------------    
class Invitation(db.Model):
    __tablename__ = "invitation"

    invitation_id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.customer_id', ondelete="CASCADE"), nullable=False)
    role = db.Column(db.Enum(UserRoles), nullable=False)
    invitation_email = db.Column(db.String(100), nullable=False,unique=True)
    token_hash = db.Column(db.String(64), nullable=False, unique=True)
    revoked = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    expires_at = db.Column(db.DateTime(timezone=True), nullable=False)
    used = db.Column(db.Boolean, default=False, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)

    # Relationships
    created_by_user = db.relationship('User', back_populates='created_invitations')
    customer = db.relationship('Customer', back_populates='invitations')

# -----------------------------------------
# TWILIO AGENT
# -----------------------------------------
class TwilioAgentStatus(db.Model):
    __tablename__ = "agent_status"
    
    twilio_agent_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id', ondelete="CASCADE"), unique=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.customer_id', ondelete="CASCADE"))
    status = db.Column(db.String(20), default='offline')  # offline, online, busy
    available_since = db.Column(db.DateTime(timezone=True), nullable=True)
    last_updated = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (db.Index('idx_calls_user_status', 'customer_id', 'status'), )

    # Relationship
    user = db.relationship('User', back_populates='twilio_agent_status', uselist=False)
# -----------------------------------------
# TWILIO CALLS MODEL
# -----------------------------------------  
class TwilioCall(db.Model):
    __tablename__ = "twilio_calls"

    twilio_call_id = db.Column(db.Integer, primary_key=True)
    call_sid = db.Column(db.String(64))
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.customer_id', ondelete="CASCADE"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=True)
    from_number = db.Column(db.String(20))
    to_number = db.Column(db.String(20))
    calling_list_name = db.Column(db.String(255), nullable=True)
    contact_name = db.Column(db.String(255), nullable=True)
    organization_name = db.Column(db.String(255), nullable=True)
    direction = db.Column(db.String(10))
    status = db.Column(db.String(20),default='ringing')  # ringing, completed, failed, busy, no-answer,no-agent-available
    started_at = db.Column(db.DateTime(timezone=True))
    ended_at = db.Column(db.DateTime(timezone=True), nullable=True)
       
    recording_sid = db.Column(db.String(64), nullable=True)
    recording_url = db.Column(db.String(500), nullable=True)
    recording_duration = db.Column(db.Integer, nullable=True)
   
    __table_args__ = (
        db.Index('idx_calls_user_status', 'customer_id', 'to_number'),
        db.Index('idx_calls_started_direction', 'started_at', 'direction'),
    )

    # Relationships 
    user = db.relationship('User', back_populates='twilio_calls', lazy='joined')
    customer = db.relationship('Customer', back_populates='twilio_calls', lazy='joined')
