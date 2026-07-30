import os

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import UserRegister, UserLogin, ResendVerificationRequest
from auth.hashing import hash_password, verify_password
from auth.jwt_handler import create_access_token, get_current_user
from auth.verification import (
    create_verification_token,
    consume_verification_token,
    can_resend,
    set_resend_cooldown,
)
from auth.email_utils import send_verification_email

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

    response.set_cookie(

    key="access_token",

    value=access_token,

    httponly=True,

    secure=os.getenv("COOKIE_SECURE", "False") == "True",   # set COOKIE_SECURE=True in prod (HTTPS)

    samesite="lax",

    max_age=60 * 60

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

@router.post("/logout")
def logout(response: Response):

    response.delete_cookie(
        key="access_token"
    )

    return {
        "message": "Logged out successfully."
    }