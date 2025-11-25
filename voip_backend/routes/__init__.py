from .contact_routes import contact_bp
from .organization_routes import organization_bp
from .callinglist_routes import callinglist_bp
from .call_log_routes import calllog_bp
from .contact_calling_list_routes import contact_callinglist_bp
from .preview_file_routes import preview_file_bp
from .user_routes import user_bp
from .invitation_routes import invitation_bp
from .customer_routes import customer_bp

def register_routes(app):
    app.register_blueprint(contact_bp, url_prefix='/api/contacts')
    app.register_blueprint(organization_bp, url_prefix='/api/organizations')
    app.register_blueprint(callinglist_bp, url_prefix='/api/callinglist') 
    app.register_blueprint(calllog_bp, url_prefix='/api/calllogs')
    app.register_blueprint(contact_callinglist_bp, url_prefix='/api/concalllist')
    app.register_blueprint(preview_file_bp, url_prefix='/api/preview')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(invitation_bp, url_prefix='/api/invitations')
    app.register_blueprint(customer_bp, url_prefix='/api/customers')

