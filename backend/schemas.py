from datetime import datetime
from pydantic import BaseModel, EmailStr
from datetime import datetime

class InspectionCreate(BaseModel):

    image_name: str
    prediction: str
    confidence: float
    model_name: str
    structure_type: str


class InspectionResponse(InspectionCreate):

    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ============================
# Register
# ============================

class UserRegister(BaseModel):

    username: str

    email: EmailStr

    password: str


# ============================
# Login
# ============================

class UserLogin(BaseModel):

    email: EmailStr

    password: str


# ============================
# User Response
# ============================

class UserResponse(BaseModel):

    id: int

    username: str

    email: EmailStr

    is_verified: bool

    created_at: datetime

    class Config:

        from_attributes = True


# ============================
# JWT Token
# ============================

class Token(BaseModel):

    access_token: str

    token_type: str


# ============================
# JWT Payload
# ============================

class TokenData(BaseModel):

    email: str | None = None


# ============================
# Resend Verification
# ============================

class ResendVerificationRequest(BaseModel):

    email: EmailStr