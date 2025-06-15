#register routes
"""
from src.voip_backend.routes.contact_routes import contact_bp
from src.voip_backend.routes.call_log_routes import calllog_bp
from src.voip_backend.routes.organization_routes import organization_bp
from src.voip_backend.routes.status_routes import status_bp
from src.voip_backend.routes.callinglist_routes import callinglist_bp
from src.voip_backend.routes.twilio_routes import twilio_bp



def register_routes(app):
    app.register_blueprint(contact_bp, url_prefix="/api/contacts")
    app.register_blueprint(organization_bp, url_prefix="/api/organizations")
    app.register_blueprint(status_bp, url_prefix="/api/statuses")
    app.register_blueprint(callinglist_bp, url_prefix="/api/callinglists")
    app.register_blueprint(calllog_bp, url_prefix='/api/calllogs')
    app.register_blueprint(twilio_bp, url_prefix="/api/twilio")
"""