import os
import uuid
from datetime import datetime, timedelta

from dotenv import load_dotenv
from jose import jwt, JWTError

from auth.redis_client import redis_client

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

REFRESH_PREFIX = "refresh_token:"


def create_refresh_token(email: str) -> str:
    """
    Issues a JWT refresh token and records its jti in Redis — Redis is the
    source of truth for validity, which is what lets us revoke a refresh
    token on logout or rotate it out after use (a bare JWT can't be revoked
    before its own expiry).
    """

    jti = str(uuid.uuid4())
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    token = jwt.encode(
        {
            "sub": email,
            "purpose": "refresh",
            "jti": jti,
            "exp": expire,
        },
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    redis_client.setex(
        f"{REFRESH_PREFIX}{jti}",
        REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        email,
    )

    return token


def verify_and_rotate_refresh_token(token: str):
    """
    Validates a refresh token and rotates it (deletes the old one, issues a
    brand new one) — this is "refresh token rotation": every use consumes
    the token, so a stolen-and-reused old token is immediately detectable
    (its jti won't be in Redis anymore).

    Returns (email, new_refresh_token). Raises ValueError on failure.
    """

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise ValueError("Invalid or expired refresh token.")

    if payload.get("purpose") != "refresh":
        raise ValueError("Invalid refresh token.")

    jti = payload.get("jti")
    email = payload.get("sub")

    if not jti or not email:
        raise ValueError("Invalid refresh token.")

    key = f"{REFRESH_PREFIX}{jti}"
    stored_email = redis_client.get(key)

    if stored_email is None:
        raise ValueError(
            "Refresh token has been revoked or already used. Please log in again."
        )

    # Rotation: old token is consumed, a new one takes its place
    redis_client.delete(key)

    new_token = create_refresh_token(email)

    return email, new_token


def revoke_refresh_token(token: str) -> None:
    """Best-effort invalidation, used on logout."""

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return

    jti = payload.get("jti")

    if jti:
        redis_client.delete(f"{REFRESH_PREFIX}{jti}")