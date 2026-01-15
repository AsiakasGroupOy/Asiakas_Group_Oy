import logging
from logging.handlers import RotatingFileHandler, SMTPHandler
import os
from config import Config
from dotenv import load_dotenv

load_dotenv()

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

     # --- Audit application log ---
    audit_handler = RotatingFileHandler(
        os.path.join(LOG_DIR, "audit.log"),
        maxBytes=5_000_000,
        backupCount=3,
        encoding="utf-8"
    )
    audit_handler.setLevel(logging.INFO)
    audit_handler.setFormatter(formatter)

    # --- Twilio application log ---
    twilio_handler = RotatingFileHandler(
        os.path.join(LOG_DIR, "twilio.log"),
        maxBytes=5_000_000,
        backupCount=3,
        encoding="utf-8"
    )
    twilio_handler.setLevel(logging.INFO)
    twilio_handler.setFormatter(formatter)

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
        mailhost=(Config.MAIL_SERVER, Config.MAIL_PORT),
        fromaddr=f"Soitto.ai NoReply <{Config.MAIL_USERNAME}>",
        toaddrs=[Config.APP_ADMIN_EMAIL],
        subject="Critical error in Soitto.ai app",
        credentials=(Config.MAIL_USERNAME, Config.MAIL_PASSWORD),
        secure=()  # Use TLS
    )
    mail_handler.setLevel(logging.ERROR)
    mail_handler.setFormatter(formatter)

    # --- Root logger configuration ---
    root_logger = logging.getLogger("app")
    root_logger.setLevel(logging.INFO)
    root_logger.addHandler(app_handler)
    root_logger.addHandler(console_handler)
    root_logger.addHandler(mail_handler)

    # --- Audit logger configuration ---
    audit_logger = logging.getLogger("audit")
    audit_logger.setLevel(logging.INFO)
    audit_logger.addHandler(audit_handler)
    audit_logger.addHandler(mail_handler)
    audit_logger.propagate = False  # prevent duplicate logging to root

    # --- Twilio logger configuration ---
    twilio_logger = logging.getLogger("twilio")
    twilio_logger.setLevel(logging.INFO)
    twilio_logger.addHandler(twilio_handler)
    twilio_logger.addHandler(mail_handler)  # send critical twilio issues to email
    twilio_logger.propagate = False  # # prevent duplicate logging to root
    

    # --- Security logger configuration ---
    security_logger = logging.getLogger("security")
    security_logger.setLevel(logging.WARNING)
    security_logger.addHandler(security_handler)
    security_logger.addHandler(mail_handler)  # send critical security issues to email
    security_logger.propagate = False  # prevent duplicate logging

    return security_logger, twilio_logger, audit_logger, root_logger