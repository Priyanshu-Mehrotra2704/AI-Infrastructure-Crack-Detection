import os
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


def verify_google_token(credential: str) -> dict:
    """
    Verifies a Google ID token (received from Google Identity Services on
    the frontend) and returns its payload — includes email, name, sub
    (Google user id), email_verified, etc. Raises ValueError on any
    failure (invalid signature, wrong audience, expired, unverified email).
    """

    try:
        idinfo = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except ValueError as e:
        raise ValueError(f"Invalid Google token: {e}")

    if idinfo.get("iss") not in ("accounts.google.com", "https://accounts.google.com"):
        raise ValueError("Invalid token issuer.")

    if not idinfo.get("email_verified", False):
        raise ValueError("Google account email is not verified.")

    return idinfo