import os
import uuid
from datetime import datetime, timedelta

from dotenv import load_dotenv
from jose import jwt, JWTError

from auth.redis_client import redis_client

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

VERIFY_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("VERIFY_TOKEN_EXPIRE_MINUTES", "30")
)
RESEND_COOLDOWN_SECONDS = int(
    os.getenv("VERIFY_RESEND_COOLDOWN_SECONDS", "60")
)

VERIFY_PREFIX = "email_verify:"          
COOLDOWN_PREFIX = "email_verify_cooldown:"  


def create_verification_token(email: str) -> str:
    """
    Issues a JWT for email verification and records its jti in Redis.
    Redis is the source of truth for "is this token still unused" — the JWT's
    own exp claim isn't enough, since a JWT can't be revoked or marked
    single-use on its own.
    """

    jti = str(uuid.uuid4())
    expire = datetime.utcnow() + timedelta(minutes=VERIFY_TOKEN_EXPIRE_MINUTES)

    token = jwt.encode(
        {
            "sub": email,
            "purpose": "email_verification",
            "jti": jti,
            "exp": expire,
        },
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    redis_client.setex(
        f"{VERIFY_PREFIX}{jti}",
        VERIFY_TOKEN_EXPIRE_MINUTES * 60,
        email,
    )

    return token


def consume_verification_token(token: str) -> str:
    """
    Validates a verification token and invalidates it so it can't be replayed.
    Returns the email on success, raises ValueError with a user-facing message
    on failure.
    """

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise ValueError("This verification link is invalid or has expired.")

    if payload.get("purpose") != "email_verification":
        raise ValueError("This verification link is invalid.")

    jti = payload.get("jti")
    email = payload.get("sub")

    if not jti or not email:
        raise ValueError("This verification link is invalid.")

    key = f"{VERIFY_PREFIX}{jti}"
    stored_email = redis_client.get(key)

    if stored_email is None:
        raise ValueError(
            "This verification link has expired or was already used. "
            "Please request a new one."
        )

    redis_client.delete(key)

    return email


def can_resend(email: str) -> bool:
    return redis_client.get(f"{COOLDOWN_PREFIX}{email}") is None


def set_resend_cooldown(email: str) -> None:
    redis_client.setex(f"{COOLDOWN_PREFIX}{email}", RESEND_COOLDOWN_SECONDS, "1")