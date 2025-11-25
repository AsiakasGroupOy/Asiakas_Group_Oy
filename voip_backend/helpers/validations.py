import re

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


# Phone number validation
def validate_phone(phone):
    # basic phone validation: digits and +, -, spaces
    if not phone:
        return False
    
    cleaned = re.sub(r"[^\d]", "", phone) # Remove all but digits

    if re.match(r"^\d{6,15}$", cleaned): # Length between 6 and 15 digits
        return "+" + cleaned
    return False


# Password validation
def is_valid_password(password: str) -> tuple[bool, list[str]]:
    
    errors = []

    if len(password) < 8:
        errors.append("Password must be at least 8 characters long. ")
    if len(password) > 128:
        errors.append("Password must not exceed 128 characters. ")

    if not re.search(r"[A-Z]", password):
        errors.append("Password must include at least one uppercase letter. ")
    if not re.search(r"[a-z]", password):
        errors.append("Password must include at least one lowercase letter. ")
    if not re.search(r"\d", password):
        errors.append("Password must include at least one digit. ")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-+=]", password):
        errors.append("Password must include at least one special character. ")
    
    return {
        "valid": len(errors) == 0,
        "errors": errors
    }