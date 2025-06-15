from sqlalchemy import Column, Integer, String, Table, ForeignKey
from sqlalchemy.orm import relationship
from src.voip_backend.extensions import db

# Association table for many-to-many relationship between Company and CallingList
# This acts as a bridge table with foreign keys pointing to both sides
company_callinglist = Table(
    'company_callinglist',
    db.metadata,
    Column('company_id', Integer, ForeignKey('companies.id'), primary_key=True),
    Column('callinglist_id', Integer, ForeignKey('calling_lists.id'), primary_key=True)
)

class Company(db.Model):
    __tablename__ = 'companies'

    # Unique identifier for each company
    id = Column(Integer, primary_key=True)

    # Company name (required and unique)
    name = Column(String(255), nullable=False, unique=True)

    # Optional website URL
    website = Column(String(255))

    # One-to-many relationship with contacts
    # This assumes a foreign key 'company_id' exists in the ContactList table
    contacts = relationship('ContactList', backref='company', lazy=True)

    # Many-to-many relationship with calling lists via the association table
    calling_lists = relationship(
        'CallingList',
        secondary=company_callinglist,  # bridge table
        back_populates='companies',     # defined in CallingList model
        lazy='joined'                   # eager loading for performance in APIs
    )

    def __repr__(self):
        return f"<Company(id={self.id}, name='{self.name}')>"
    
    

# -----------------------------------------
# CALLING LIST MODEL
# -----------------------------------------
class CallingList(db.Model):
    __tablename__ = "calling_lists"

    # Unique identifier for each calling list
    id = db.Column(db.Integer, primary_key=True)

    # Calling list name (must be unique)
    name = db.Column(db.String(255), nullable=False, unique=True)

    # One-to-many relationship with contacts
    contacts = db.relationship(
        'ContactList',
        backref='calling_list',
        lazy=True,
        cascade="all, delete"
    )

    # Many-to-many relationship with companies via bridge table
    companies = db.relationship(
        'Company',
        secondary=company_callinglist,
        back_populates='calling_lists',
        lazy='joined'
    )

    def __repr__(self):
        return f"<CallingList(id={self.id}, name='{self.name}')>"



# STATUS MODEL
# -----------------------------------------
class Status(db.Model):
    __tablename__ = "status"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)

    call_logs = db.relationship('CallLog', backref='status', lazy=True)

    def __repr__(self):
        return f"<Status(id={self.id}, name='{self.name}')>"
        
        

# -----------------------------------------
# CONTACT LIST MODEL
# -----------------------------------------
class ContactList(db.Model):
    __tablename__ = "contact_list"

    # Unique identifier for each contact
    id = db.Column(db.Integer, primary_key=True)

    # Basic contact info
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    job_title = db.Column(db.String(100))
    phone = db.Column(db.String(50))
    email = db.Column(db.String(255), unique=True)
    note = db.Column(Text)

    # Foreign key to company
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id', ondelete="SET NULL"), nullable=True)

    # Foreign key to calling list
    calling_list_id = db.Column(db.Integer, db.ForeignKey('calling_lists.id', ondelete="SET NULL"), nullable=True)

    # One-to-many relationship with call logs
    call_logs = db.relationship('CallLog', backref='contact', lazy=True, cascade="all, delete")

    def __repr__(self):
        return f"<ContactList(id={self.id}, name='{self.first_name} {self.last_name}')>"


# -----------------------------------------
# CALL LOG MODEL
# -----------------------------------------
class CallLog(db.Model):
    __tablename__ = "call_log"

    id = db.Column(db.Integer, primary_key=True)
    contact_id = db.Column(db.Integer, db.ForeignKey('contact_list.id', ondelete="CASCADE"), nullable=False)
    status_id = db.Column(db.Integer, db.ForeignKey('status.id'), nullable=True)
    call_timestamp = db.Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<CallLog(id={self.id}, contact_id={self.contact_id}, status_id={self.status_id})>"