import os
import secrets

from fastapi import APIRouter, BackgroundTasks, Cookie, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import UserRegister, UserLogin, ResendVerificationRequest, GoogleLoginRequest
from auth.hashing import hash_password, verify_password
from auth.jwt_handler import create_access_token, get_current_user
from auth.google_auth import verify_google_token
from auth.verification import (
    create_verification_token,
    consume_verification_token,
    can_resend,
    set_resend_cooldown,
)
from auth.email_utils import send_verification_email
from auth.refresh_token import (
    create_refresh_token,
    verify_and_rotate_refresh_token,
    revoke_refresh_token,
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register")
def register_user(
    user: UserRegister,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):

    # -----------------------
    # Check Username
    # -----------------------

    existing_username = (
        db.query(User)
        .filter(User.username == user.username)
        .first()
    )

    if existing_username:

        raise HTTPException(
            status_code=400,
            detail="Username already exists."
        )

    # -----------------------
    # Check Email
    # -----------------------

    existing_email = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_email:

        raise HTTPException(
            status_code=400,
            detail="Email already registered."
        )

    # -----------------------
    # Password Length
    # -----------------------

    if len(user.password) < 8:

        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 8 characters."
        )

    # -----------------------
    # Create User
    # -----------------------

    new_user = User(

        username=user.username,

        email=user.email,

        password=hash_password(
            user.password
        )

    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    # -----------------------
    # Send Verification Email
    # -----------------------

    token = create_verification_token(new_user.email)

    background_tasks.add_task(
        send_verification_email,
        new_user.email,
        token
    )

    return {

        "message": "User registered successfully. Please check your email to verify your account."

    }


# Login

@router.post("/login")
def login_user(
    response: Response,
    user: UserLogin,
    db: Session = Depends(get_db)
):
    existing_user = (

        db.query(User)

        .filter(User.email == user.email)

        .first()

    )

    if existing_user is None:

        raise HTTPException(

            status_code=401,

            detail="Invalid email or password."

        )

    if not verify_password(

        user.password,

        existing_user.password

    ):

        raise HTTPException(

            status_code=401,

            detail="Invalid email or password."

        )

    if not existing_user.is_verified:

        raise HTTPException(

            status_code=403,

            detail="EMAIL_NOT_VERIFIED"

        )

    access_token = create_access_token(

        {

            "sub": existing_user.email

        }

    )

    refresh_token = create_refresh_token(existing_user.email)

    response.set_cookie(

    key="access_token",

    value=access_token,

    httponly=True,

    secure=os.getenv("COOKIE_SECURE", "False") == "True",   # set COOKIE_SECURE=True in prod (HTTPS)

    samesite="lax",

    max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60

    )

    response.set_cookie(

    key="refresh_token",

    value=refresh_token,

    httponly=True,

    secure=os.getenv("COOKIE_SECURE", "False") == "True",

    samesite="lax",

    max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60

    )

    return {
    "message": "Login successful"
    }


# -----------------------
# Verify Email
# -----------------------

@router.get("/verify-email")
def verify_email(
    token: str,
    db: Session = Depends(get_db)
):

    try:
        email = consume_verification_token(token)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")

    if user.is_verified:
        return {"message": "Email already verified."}

    user.is_verified = True
    db.commit()

    return {"message": "Email verified successfully."}


# -----------------------
# Resend Verification Email
# -----------------------

@router.post("/resend-verification")
def resend_verification(
    payload: ResendVerificationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.email == payload.email)
        .first()
    )

    # Don't reveal whether the email exists — same response either way
    if user is None or user.is_verified:
        return {
            "message": "If that email is registered and unverified, a new link has been sent."
        }

    if not can_resend(user.email):
        raise HTTPException(
            status_code=429,
            detail="Please wait a bit before requesting another verification email."
        )

    token = create_verification_token(user.email)
    set_resend_cooldown(user.email)

    background_tasks.add_task(
        send_verification_email,
        user.email,
        token
    )

    return {
        "message": "If that email is registered and unverified, a new link has been sent."
    }


@router.get("/me")
def get_me(

    current_user: User = Depends(get_current_user)

):

    return {

        "id": current_user.id,

        "username": current_user.username,

        "email": current_user.email

    }

@router.post("/google")
def google_login(
    payload: GoogleLoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):

    try:
        idinfo = verify_google_token(payload.credential)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

    email = idinfo["email"]
    name = idinfo.get("name") or email.split("@")[0]

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if user is None:

        # Make sure the auto-picked username doesn't collide with an
        # existing one (username has a unique constraint)
        base_username = name
        final_username = base_username
        suffix = 1

        while db.query(User).filter(User.username == final_username).first():
            final_username = f"{base_username}{suffix}"
            suffix += 1

        # Password is unusable (random, never shown to the user) since
        # they authenticate via Google, not a password
        random_password = secrets.token_urlsafe(32)

        user = User(
            username=final_username,
            email=email,
            password=hash_password(random_password),
            is_verified=True,   # Google already verified this email address
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token({"sub": user.email})
    refresh_token = create_refresh_token(user.email)

    response.set_cookie(

        key="access_token",

        value=access_token,

        httponly=True,

        secure=os.getenv("COOKIE_SECURE", "False") == "True",

        samesite="lax",

        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60

    )

    response.set_cookie(

        key="refresh_token",

        value=refresh_token,

        httponly=True,

        secure=os.getenv("COOKIE_SECURE", "False") == "True",

        samesite="lax",

        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60

    )

    return {
        "message": "Login successful"
    }


@router.post("/refresh")
def refresh_access_token(
    response: Response,
    refresh_token: str = Cookie(None, alias="refresh_token"),
):

    if refresh_token is None:

        raise HTTPException(
            status_code=401,
            detail="No refresh token found. Please log in again."
        )

    try:
        email, new_refresh_token = verify_and_rotate_refresh_token(refresh_token)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

    new_access_token = create_access_token({"sub": email})

    response.set_cookie(

    key="access_token",

    value=new_access_token,

    httponly=True,

    secure=os.getenv("COOKIE_SECURE", "False") == "True",

    samesite="lax",

    max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60

    )

    response.set_cookie(

    key="refresh_token",

    value=new_refresh_token,

    httponly=True,

    secure=os.getenv("COOKIE_SECURE", "False") == "True",

    samesite="lax",

    max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60

    )

    return {
        "message": "Token refreshed."
    }


@router.post("/logout")
def logout(
    response: Response,
    refresh_token: str = Cookie(None, alias="refresh_token"),
):

    if refresh_token:
        revoke_refresh_token(refresh_token)

    response.delete_cookie(
        key="access_token"
    )

    response.delete_cookie(
        key="refresh_token"
    )

    return {
        "message": "Logged out successfully."
    }