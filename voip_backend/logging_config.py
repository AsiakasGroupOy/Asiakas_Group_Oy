import logging
from logging.handlers import RotatingFileHandler, SMTPHandler
import os

# Create logs directory if it doesn't exist
LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)

def setup_logging():
    # Common log format
    formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")

    # --- General application log ---
    app_handler = RotatingFileHandler(
        os.path.join(LOG_DIR, "app.log"),
        maxBytes=5_000_000,
        backupCount=3,
        encoding="utf-8"
    )
    app_handler.setLevel(logging.INFO)
    app_handler.setFormatter(formatter)

    # --- Security-related warnings/errors log ---
    security_handler = RotatingFileHandler(
        os.path.join(LOG_DIR, "security.log"),
        maxBytes=2_000_000,
        backupCount=2,
        encoding="utf-8"
    )
    security_handler.setLevel(logging.WARNING)
    security_handler.setFormatter(formatter)

    # --- Console output ---
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)

    # --- SMTP handler for critical errors (ERROR+) ---
    # ⚠️ Replace with your actual SMTP server, credentials, and recipients
    mail_handler = SMTPHandler(
        mailhost=("smtp.example.co", 587),
        fromaddr="app@example.co",
        toaddrs=["admin@example.co"],
        subject="Critical error in Flask app",
        credentials=("app@example.co", "password"),
        secure=()  # Use TLS
    )
    mail_handler.setLevel(logging.ERROR)
    mail_handler.setFormatter(formatter)

    # --- Root logger configuration ---
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.addHandler(app_handler)
    root_logger.addHandler(console_handler)
    root_logger.addHandler(mail_handler)

    # --- Security logger configuration ---
    security_logger = logging.getLogger("security")
    security_logger.setLevel(logging.WARNING)
    security_logger.addHandler(security_handler)
    security_logger.addHandler(mail_handler)  # send critical security issues to email
    security_logger.propagate = False  # prevent duplicate logging

    return security_logger