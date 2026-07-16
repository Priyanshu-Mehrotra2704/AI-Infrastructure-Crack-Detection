from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import UserRegister, UserLogin
from auth.hashing import hash_password, verify_password
from auth.jwt_handler import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register")
def register_user(
    user: UserRegister,
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

    return {

        "message": "User registered successfully."

    }
# Login 
@router.post("/login")
def login_user(

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

    access_token = create_access_token(

        {

            "sub": existing_user.email

        }

    )

    return {

        "access_token": access_token,

        "token_type": "bearer"

    }