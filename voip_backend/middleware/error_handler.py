import logging
from flask import request, g, jsonify
from werkzeug.exceptions import HTTPException

security_logger = logging.getLogger("security")

def register_global_error_handler(app):
    @app.errorhandler(Exception)
    def handle_exception(e):
        if isinstance(e, HTTPException):
            code = e.code
            msg = e.description
            if code == 403:
                return jsonify({"error": msg}), 403
            level = logging.WARNING if code < 500 else logging.ERROR
        else:
            code = 500
            msg = str(e)
            level = logging.ERROR

        security_logger.log(
            level,
            "Unhandled exception: code=%s message=%s method=%s path=%s user_id=%s customer_id=%s ip=%s",
            code, msg, request.method, request.path, g.get("user_id"), g.get("customer_id"), request.remote_addr
        )
        return jsonify({"error": msg}), code