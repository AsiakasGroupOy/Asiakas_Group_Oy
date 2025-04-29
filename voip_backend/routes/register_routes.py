from routes.contact_routes import contacts_bp
from routes.call_log_routes import calllog_bp 
from routes.organization_routes import organization_bp
from routes.status_routes import status_bp
from routes.callinglist_routes import callinglist_bp

def register_routes(app):
    app.register_blueprint(contacts_bp, url_prefix="/api/contacts")
    app.register_blueprint(organization_bp, url_prefix="/api/organizations")
    app.register_blueprint(status_bp, url_prefix="/api/statuses")
    app.register_blueprint(callinglist_bp, url_prefix="/api/callinglists")
    app.register_blueprint(calllog_bp, url_prefix='/api/calllogs')