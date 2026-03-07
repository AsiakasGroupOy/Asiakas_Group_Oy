from flask import Blueprint, request, jsonify, current_app, g
from models.models import TwilioCall
from extensions import db
from datetime import datetime, timezone
from twilio.twiml.voice_response import VoiceResponse, Dial, Client
from helpers.helpers import auth_required
from services.twilio_service import free_agent, busy_agent, get_customer_id_by_phone, get_call_record_by_sid, get_preferred_agent,parse_identity, get_company_phone, generate_twilio_token,twilio_webhook, get_twilio_config
import logging


twilio_bp = Blueprint('twilio_bp', __name__)
twilio_logger = logging.getLogger("twilio")
app_logger = logging.getLogger("app")

# 🔐 1. Twilio Access Token for WebRTC
@twilio_bp.route('/token', methods=['GET'])
@auth_required

def twilio_token():
    try:
        # Unique identity format
        identity = f"customer_{g.customer_id}_user_{g.user_id}"
        token = generate_twilio_token(identity)

        return jsonify({"token": token}), 200
    except Exception as e:
        twilio_logger.error("Twilio token generation failed: user_id=%s, customer_id=%s, error=%s",g.user_id, g.customer_id, str(e))
        return jsonify({"error": "Failed to generate token"}), 500

# ✅ Twilio outgoing call TwiML
def outbound_call():
    call_sid = request.form.get('CallSid') # Parent call sid for status callbacks
    from_param = request.form.get('From') # Client identity from token
    to_number = request.form.get('To')
    calling_list_name = request.form.get('calling_list_name')
    contact_name = request.form.get('contact_name')
    organization_name = request.form.get('organization_name')

    customer_id, user_id = parse_identity(from_param) 
    if not customer_id or not user_id:
        app_logger.warning("Invalid From parameter in outbound call: from_param=%s ip=%s path=%s",from_param, request.remote_addr, request.path)
        return jsonify ({"error":"Invalid From parameter."}),400

    callerId= get_company_phone(customer_id) # To get customer's Twilio number for outbound call
    if not callerId:
        app_logger.warning("Customer does not have an assigned Twilio number: customer_id=%s ip=%s path=%s",customer_id, request.remote_addr, request.path)
        return jsonify ({"error":"Customer does not have an assigned Twilio number."}),400
    
    # Create a TwilioCall record    
    call_record = TwilioCall(
        call_sid=call_sid,
        customer_id=int(customer_id),
        user_id=int(user_id),
        from_number=callerId,
        to_number=to_number,
        direction='outbound',
        started_at=datetime.now(timezone.utc),
        calling_list_name=calling_list_name,
        contact_name=contact_name,
        organization_name=organization_name
    )
    db.session.add(call_record)
    db.session.commit()
    
    # Update agent status to 'busy'    
    busy_agent(int(user_id))
   
    # Generate TwiML response 
    response = VoiceResponse()
    dial = Dial(
        callerId=callerId, 
        record='record-from-answer-dual') 
      
    dial.number(to_number,
            statusCallback=f'{get_twilio_config()["FRONTEND_URL"]}/api/twilio/call-status',
            statusCallbackEvent="completed")
    response.append(dial)

    twilio_logger.info("Outbound call initiated by user_id=%s, customer_id=%s to_number=%s call_sid=%s", user_id, customer_id, to_number, call_sid)

    return str(response)

# ✅ Twilio call status callback
@twilio_bp.route('/call-status', methods=['POST'])
@twilio_webhook
def call_status():
    call_sid = request.form.get('ParentCallSid')
    status = request.form.get('CallStatus')
    recording_sid = request.form.get('RecordingSid')
    recording_url = request.form.get('RecordingUrl') 
    recording_duration = request.form.get('RecordingDuration')
    
    call_record = get_call_record_by_sid(call_sid)
    if not call_record:
        twilio_logger.error(
            "Call status callback: record not found call_sid=%s ip=%s path=%s",call_sid, request.remote_addr, request.path)
        
    
    # Call ended, update record 
    call_record.status = status
    call_record.ended_at = datetime.now(timezone.utc)
    if recording_sid:
        call_record.recording_sid = recording_sid
        call_record.recording_url = recording_url
        raw_seconds = float(recording_duration or 0)
        call_record.recording_duration = round(raw_seconds / 60, 2)
        
    db.session.commit()

    free_agent(call_record.user_id)
    
    twilio_logger.info("Call status updated: call_sid=%s status=%s", call_sid, status)

    return '', 204  

# ✅ Twilio inbound call TwiML
def call_inbound():
    call_sid = request.form.get('CallSid')
    to_number = request.form.get('To')
    from_number = request.form.get('From')

    customer_id, customer_name = get_customer_id_by_phone(to_number)
    if not customer_id:
        resp = VoiceResponse()
        resp.say("Company is not available", language='fi-FI')
        return str(resp)
    
    # Choose preferred agent based on last outbound call on incoming number "from_number" or availability
    assigned_userId, context_data = get_preferred_agent(customer_id, from_number)

    calling_list_name = context_data.get('calling_list_name') if context_data else None,
    contact_name = context_data.get('contact_name',"") if context_data else None,
    organization_name = context_data.get('organization_name') if context_data else None


    # Create a TwilioCall record (ringing)
    call_record = TwilioCall(
        call_sid=call_sid,
        customer_id=customer_id,
        user_id=assigned_userId if assigned_userId else None,
        from_number=from_number,
        to_number=to_number,
        direction='inbound',
        started_at=datetime.now(timezone.utc),
        calling_list_name = calling_list_name,
        contact_name = contact_name,
        organization_name = organization_name
    )

    db.session.add(call_record)
    
    resp = VoiceResponse()

    if assigned_userId:
        busy_agent(int(assigned_userId))

        dial = Dial(callerId=from_number, 
                    record='record-from-answer-dual',
                    )
        
        client_noun = Client(f"customer_{customer_id}_user_{assigned_userId}",
        status_callback=f'{get_twilio_config()["FRONTEND_URL"]}/api/twilio/call-status',
        status_callback_event="completed",
        status_callback_method="POST"
        )
        
        client_noun.parameter(name="from_number", value=from_number)
        client_noun.parameter(name="organization_name", value=organization_name if organization_name else "Unknown")

        dial.append(client_noun)
        resp.append(dial)

    else:
        call_record.status = 'no-agent-available' 
        call_record.ended_at = datetime.now(timezone.utc)
        
        resp.say("All operators are busy", language='en-EN')
        resp.hangup()

    db.session.commit()

    twilio_logger.info("Inbound call received for call_sid=%s customer_id=%s assigned_userId=%s method=%s path=%s ip=%s", call_sid, customer_id, assigned_userId, request.method, request.path, request.remote_addr)
    return str(resp)


# ✅ Twilio outgoing call TwiML
@twilio_bp.route('/voice', methods=['POST'])
@twilio_webhook
def voice_call():
    from_param = request.form.get('From') # Client identity from token
   
    if from_param.startswith('client:'):
        return outbound_call()

    return call_inbound()

