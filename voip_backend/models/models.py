from extensions import db
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
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

    # Relationships
    contacts = db.relationship('ContactList', backref='organization', lazy=True)
    

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

    # Relationships
    contact_calling_lists = db.relationship('ContactCallingList', back_populates='contact')
    

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
    call_timestamp = db.Column(db.DateTime, default=datetime.now, nullable=False)
    

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
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.customer_id', ondelete="CASCADE"), nullable=False)

    __table_args__ = (
            db.UniqueConstraint('contact_id', 'calling_list_id', 'customer_id', name='uq_cust_cont_call_list'),
        )
    
     # Relationships

    contact = db.relationship('ContactList', back_populates='contact_calling_lists')
    calling_list = db.relationship('CallingList', back_populates='contact_calling_lists')
    call_logs = db.relationship('CallLog', back_populates='contact_calling_list', cascade="all, delete-orphan", passive_deletes=True)
    

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
    username = db.Column(db.String(50), unique=True, nullable=False)
    useremail = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum(UserRoles), nullable=False)

    __table_args__ = (
        db.UniqueConstraint("customer_id", "useremail", name="uq_user_email_per_customer"),
    )

    def set_password(self, userpassword):
        self.password_hash = generate_password_hash(userpassword)

    def check_password(self, userpassword):
        return check_password_hash(self.password_hash, userpassword)

    @property
    def is_admin(self):
        return self.role == UserRoles.APP_ADMIN.value
    @property
    def is_manager(self):
        return self.role == UserRoles.CALL_MANAGER.value
    @property
    def is_user(self):
        return self.role == UserRoles.CALL_USER.value
  


# -----------------------------------------
# CUSTOMER MODEL
# -----------------------------------------
class Customer(db.Model):
    __tablename__ = "customer"

    customer_id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(255), nullable=False)
    customer_address = db.Column(db.String(100), unique=True, nullable=False)
    assigned_number = db.Column(db.String(20), unique=True, nullable=True, default=None)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(), onupdate=datetime.now, nullable=False)

    # Relationships 
    users = db.relationship('User', backref='customer', lazy=True, cascade="all, delete-orphan", passive_deletes=True)
    organizations = db.relationship('Organization', backref='customer', lazy=True, cascade="all, delete-orphan", passive_deletes=True)
    calling_lists = db.relationship('CallingList', backref='customer', lazy=True, cascade="all, delete-orphan", passive_deletes=True)
    contacts = db.relationship('ContactList', backref='customer', lazy=True, cascade="all, delete-orphan", passive_deletes=True)
    contact_calling_lists = db.relationship('ContactCallingList', backref='customer', lazy=True, cascade="all, delete-orphan", passive_deletes=True)
    invitations = db.relationship('Invitation', backref='customer', lazy=True, cascade="all, delete-orphan", passive_deletes=True)
    

# -----------------------------------------
# INVITATION MODEL
# -----------------------------------------    
class Invitation(db.Model):
    __tablename__ = "invitation"

    invitation_id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.customer_id', ondelete="CASCADE"), nullable=False)
    role = db.Column(db.Enum(UserRoles), nullable=False)
    invitation_email = db.Column(db.String(100), nullable=False)
    token_hash = db.Column(db.String(64), nullable=False, unique=True)
    revoked = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.now, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False, nullable=False)

# -----------------------------------------
# TWILIO NUMBERS MODEL
# -----------------------------------------  