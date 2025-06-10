import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from faker import Faker
from dotenv import load_dotenv

from extensions import db
from models.models import Organization, CallingList, ContactList, ContactCallingList
from app import app

load_dotenv()
fake = Faker()

def preload_demo_data():
    with app.app_context():
        # 1. Create 5 companies
        companies = []
        for i in range(5):
            company = Organization(
                organization_name=fake.company(),
                website=fake.url()
            )
            db.session.add(company)
            companies.append(company)
        db.session.commit()

        # 2. Create 3 calling lists
        calling_lists = []
        for i in range(3):
            cl = CallingList(
                calling_list_name=f"List {i+1}"
            )
            db.session.add(cl)
            calling_lists.append(cl)
        db.session.commit()

        # 3. Create 10 contacts, randomly assigning company and calling list
        contacts = []
        for i in range(10):
            company = fake.random_element(companies)
          
            contact = ContactList(
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                job_title=fake.job(),
                phone=fake.phone_number(),
                email=fake.email(),
                
                organization_id=company.organization_id,
                
            )
            db.session.add(contact)
            contacts.append(contact)
        db.session.commit()

        # 4. Create associations in contact_calling_list
        for contact in contacts:
            # Assign 1-2 random calling lists to each contact
            assigned_lists = fake.random_elements(elements=calling_lists, length=fake.random_int(1, 2), unique=True)
            for cl in assigned_lists:
                assoc = ContactCallingList(
                    contact=contact,
                    calling_list=cl,
                    note=fake.sentence(),
                )
                db.session.add(assoc)
        db.session.commit()
        print("✅ Demo data loaded: 5 companies, 3 calling lists, 10 contacts, contact_calling_list associations.")

if __name__ == "__main__":
    preload_demo_data()