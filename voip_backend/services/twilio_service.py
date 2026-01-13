from flask import current_app, request,jsonify
from extensions import db
from datetime import datetime
from models.models import User ,Customer, TwilioCall,TwilioAgentStatus
from functools import wraps

from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import VoiceGrant
from twilio.request_validator import RequestValidator

import logging

twilio_logger = logging.getLogger("twilio")
security_logger = logging.getLogger("security")

def get_twilio_config():
    return {
        "ACCOUNT_SID": current_app.config["TWILIO_ACCOUNT_SID"],
        "AUTH_TOKEN": current_app.config["TWILIO_AUTH_TOKEN"],
        "API_KEY": current_app.config["TWILIO_API_KEY"],
        "API_SECRET": current_app.config["TWILIO_API_SECRET"],
        "TWIML_APP_SID": current_app.config["TWILIO_TWIML_APP_SID"],
        "TEMP_TWILIO_HOST": current_app.config["TEMP_TWILIO_HOST"],
    }

# Generate Twilio Access Token for WebRTC
def generate_twilio_token(identity: str) -> str:
    cfg = get_twilio_config()

    token = AccessToken(
        cfg["ACCOUNT_SID"],
        cfg["API_KEY"],
        cfg["API_SECRET"],
        identity=identity,
        region="ie1"
    )
    voice_grant = VoiceGrant(
        outgoing_application_sid=cfg["TWIML_APP_SID"],
        incoming_allow=True
    )

    token.add_grant(voice_grant)
    return token.to_jwt()

# Twilio Webhook Validation Decorator
def twilio_webhook(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        cfg = get_twilio_config()
        signature = request.headers.get("X-Twilio-Signature", "") # signature is formed with use of Auth Token 
        url = f"{cfg['TEMP_TWILIO_HOST']}{request.path}"
        params = request.form.to_dict() or {}
        validator = RequestValidator(cfg["AUTH_TOKEN"])

        if not validator.validate(url, params, signature):
            security_logger.warning("Twilio signature validation failed: url=%s method=%s path=%s ip=%s", url, request.method, request.path, request.remote_addr)
            twilio_logger.error("Twilio signature validation failed url=%s, params: %s, ip=%s", url, params, request.remote_addr)
            return jsonify ({"error": "Invalid Twilio signature"}), 403
          
        return f(*args, **kwargs)
    return decorated

# Update agent status to 'online' and set available_since
def free_agent(user_id):
    agent = TwilioAgentStatus.query.filter_by(user_id=user_id).first()
    if agent:
        agent.status = 'online'
        agent.available_since = datetime.now()
        db.session.commit()

# Update agent status to 'busy'   
def busy_agent(user_id):    
    twilio_agent = TwilioAgentStatus.query.filter_by(user_id=user_id).first()
    if twilio_agent:
        twilio_agent.status = 'busy'
        db.session.commit()


def get_customer_id_by_phone(phone):
    customer = Customer.query.filter_by(assigned_number=phone).first()
    if customer:
        return customer.customer_id, customer.customer_name
    return None, None

def get_company_phone(customer_id):
    customer = Customer.query.get(customer_id)
    return customer.assigned_number if customer else None

def get_call_record_by_sid(call_sid):
    return TwilioCall.query.filter_by(call_sid=call_sid).first()

def get_preferred_agent(customer_id, to_number):
    last_call = TwilioCall.query.filter_by(
        customer_id=customer_id,
        to_number=to_number,
        direction='outbound'
    ).order_by(TwilioCall.started_at.desc()).first()

    context_data = {}    
    if last_call and last_call.user_id:
        context_data = {
        'calling_list_name': last_call.calling_list_name,
        'contact_name': last_call.contact_name,
        'organization_name': last_call.organization_name
    }
    # Check if the initial call's agent is available
        agent = TwilioAgentStatus.query.filter_by(user_id=last_call.user_id).first()
        if agent and agent.status == 'online':
            return last_call.user_id, context_data
        
    # If initial call's agent is not available, find any free agent
    free_agent = TwilioAgentStatus.query.filter_by(
        customer_id=customer_id,
        status='online'
    ).order_by(TwilioAgentStatus.available_since).first()
    
    return free_agent.user_id if free_agent else None, context_data if context_data else None
      
# Parse identity = f"customer_{g.customer_id}_user_{g.user_id}"
def parse_identity(from_value: str):
    if not from_value:
        return None, None
    
    identity = from_value.replace("client:", "")
    parts = identity.split("_")
    
    return int(parts[1]), int(parts[3]) # returns customer_id, user_id