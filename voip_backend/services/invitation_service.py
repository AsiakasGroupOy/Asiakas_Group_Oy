from models.models import Invitation, User, UserRoles, Customer
from sqlalchemy.orm import joinedload
from extensions import db, mail
from flask_mail import Message
from datetime import datetime, timedelta,timezone
import uuid, hashlib
import logging

app_logger = logging.getLogger("app")
security_logger = logging.getLogger("security")

class InvitationService:

    @staticmethod
    def get_invitations_created_by(user_id):
        invitations = Invitation.query.filter_by(created_by=user_id).all()  
        users = User.query.all()              

        for inv in invitations:
            
            if any(u.useremail == inv.invitation_email and u.customer_id == inv.customer_id for u in users):
                db.session.delete(inv)
                db.session.commit()
                app_logger.info(
                    "Deleted invitation for email %s in customer %s as user already registered.",
                    inv.invitation_email, inv.customer_id
                )

        valid_invitations = Invitation.query.options(joinedload(Invitation.customer)).filter_by(created_by=user_id).all()
        return valid_invitations
        
    @staticmethod
    def get_users_invitations(customer_id):
        invitations = Invitation.query.filter_by(customer_id=customer_id).all()
        users = User.query.filter_by(customer_id=customer_id).all()

        for inv in invitations:
            if any(u.useremail == inv.invitation_email for u in users):
                db.session.delete(inv)
                db.session.commit()
                app_logger.info("Deleted invitation for email %s as user already registered.", inv.invitation_email)

        valid_invitations = Invitation.query.options(joinedload(Invitation.customer)).filter_by(customer_id=customer_id).all()
        return valid_invitations
    
    @staticmethod
    def create_customer(customer_name, customer_address):
       
        customer = Customer(
            customer_name=customer_name,
            customer_address=customer_address
        )
        db.session.add(customer)
        db.session.commit()
        return customer

    @staticmethod
    def create_invitation(customer_id, invitation_email, role, created_by):
        token = str(uuid.uuid4())
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        expires_at = datetime.now(timezone.utc) + timedelta(days=1)

        invitation = Invitation(
            customer_id=customer_id,
            invitation_email=invitation_email,
            token_hash=token_hash,
            role=UserRoles(role),
            expires_at=expires_at,
            created_by=created_by

        )
        db.session.add(invitation)
        db.session.commit()
        return token, invitation

    @staticmethod
    def send_invitation_email(invitation_email, role, invitation_link):
        role_translations_fi = {
       "Manager": "Päällikkö",
       "User": "Käyttäjä",
       "Admin Access": "Ylläpitäjä"
    }   
        role_fi = role_translations_fi.get(role, role)
        
        subject = "Kutsu liittyä Soitto.ai -palveluun / You're invited to join our Soitto.ai Application"
        body = f"""

        
        Hei,

        Sinut on kutsuttu liittymään järjestelmään seuraavilla tiedoilla:

        Sähköposti: {invitation_email}
        Rooli: {role_fi}

        Kutsulinkki on voimassa 24 tuntia:
        {invitation_link}

        Ystävällisin terveisin,
        Soitto.ai
    
       ----------------------------------------

        Hello,

        You have been invited to join the system with the following details:

        Email: {invitation_email}
        Role: {role}
        
        Invitation link valid for 24h:
        {invitation_link}

        Best regards,
        Soitto.ai
        """
        msg = Message(subject=subject, recipients=[invitation_email], body=body)
        mail.send(msg)

    @staticmethod
    def delete_invitation(invitation_id):
        invitation = Invitation.query.get(invitation_id)
        if not invitation:
            app_logger.error("Attempted to delete non-existent invitation ID %s", invitation_id)
            return {"status": "error", "message": "errInvitationsRemoveIdNotFound"}, 404
        db.session.delete(invitation)
        db.session.commit()
        return {"status": "success", "invitation": invitation.invitation_email}, 200
    
    
    @staticmethod
    def delete_customer_invitation(invitation_id):
        invitation = Invitation.query.get(invitation_id)
        if not invitation:
            app_logger.error("Attempted to delete non-existent invitation ID %s for customer", invitation_id)
            return {"status": "error", "message": "errInvitationsRemoveIdNotFound"}, 404
        customer = Customer.query.get(invitation.customer_id)
        if not customer:
            app_logger.error("Attempted to delete invitation ID %s but customer ID %s not found", invitation_id, invitation.customer_id)
            return {"status": "error", "message": "errInvitationsRemoveCustomerNotFound"}, 404
        
        db.session.delete(invitation)
        db.session.delete(customer)
        db.session.commit()
        return {"status": "success", "invitation": invitation.invitation_email}, 200