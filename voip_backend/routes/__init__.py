from .contact_routes import contact_bp
from .organization_routes import organization_bp
from .status_routes import status_bp
from .callinglist_routes import callinglist_bp
from .call_log_routes import calllog_bp

def register_routes(app):
    app.register_blueprint(contact_bp, url_prefix='/api/contacts')
    app.register_blueprint(organization_bp, url_prefix='/api/organizations')
    app.register_blueprint(status_bp, url_prefix='/api/statuses')
    app.register_blueprint(callinglist_bp, url_prefix='/api/callinglist') 
    app.register_blueprint(calllog_bp, url_prefix='/api/calllogs')
