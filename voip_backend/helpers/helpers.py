from flask import Flask, request, jsonify, current_app, g
from functools import wraps
from datetime import datetime, timedelta
import logging

logging.basicConfig(level=logging.INFO)
security_logger = logging.getLogger("security")

import re
import jwt

# Decorator to protect routes by validating JWTs from cookies.
# Extracts the access token from cookies, decodes and verifies it,
# and attaches user information to the Flask global context.
def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get("access_token")
        if not token:
            security_logger.warning("Access token missing: user_id=%s, customer_id=%s", g.get("user_id"),  g.get("customer_id"))
            return jsonify({"error": "Unauthorized"}), 401
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"], options={"verify_exp": True})
            g.user_id = data["user_id"]                       # To get user_id, customer_id and role from cookies
            g.customer_id = data["customer_id"]
            g.role = data["role"]
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            security_logger.error("Invalid access token: user_id=%s, customer_id=%s", g.get("user_id"),  g.get("customer_id"))
            return jsonify({"error": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated


def create_access_token(current_user=None, payload=None):
    if payload:
        user_id = payload["user_id"]
        customer_id = payload["customer_id"]
        role = payload["role"]
    else:
        user_id = current_user.user_id
        customer_id = current_user.customer_id
        role = current_user.role.value

    token_payload = {
        "user_id": user_id,
        "customer_id": customer_id,
        "role": role,
        "type": "access",
        "exp": datetime.now() + current_app.config['ACCESS_EXPIRES']  # Access token valid for 15 minutes
    }

    return jwt.encode(token_payload, current_app.config['SECRET_KEY'], algorithm="HS256")

def create_refresh_token(current_user):
    payload = {
        "user_id": current_user.user_id,
        "customer_id": current_user.customer_id,
        "role": current_user.role.value,
        "type": "refresh",
        "exp": datetime.now() + current_app.config['REFRESH_EXPIRES']  # Refresh token valid for 7 days
    }
    return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm="HS256")


# Email address validation
EMAIL_RE = re.compile(
    r'^(?=.{9,254}$)(?!.*\.\.)'              
    r'[A-Za-z0-9_+%+-]+(?:\.[A-Za-z0-9_+%+-]+)*'  
    r'@'
    r'(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+'  # domen part
    r'[A-Za-z]{1,63}$'                       # TLD
)

def is_valid_email(email: str) -> bool:
    return bool(EMAIL_RE.match(email))

 # Password validation

def is_valid_password(password: str) -> tuple[bool, list[str]]:
    
    errors = []

    if len(password) < 8:
        errors.append("Password must be at least 8 characters long.")
    if len(password) > 128:
        errors.append("Password must not exceed 128 characters.")

    if not re.search(r"[A-Z]", password):
        errors.append("Password must include at least one uppercase letter.")
    if not re.search(r"[a-z]", password):
        errors.append("Password must include at least one lowercase letter.")
    if not re.search(r"\d", password):
        errors.append("Password must include at least one digit.")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-+=]", password):
        errors.append("Password must include at least one special character.")

    return (len(errors) == 0, errors)