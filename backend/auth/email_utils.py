import os

import resend

from dotenv import load_dotenv


load_dotenv()


RESEND_API_KEY = os.getenv(
    "RESEND_API_KEY"
)

EMAIL_FROM = os.getenv(
    "EMAIL_FROM"
)

FRONTEND_URL = os.getenv(
    "FRONTEND_URL"
).rstrip("/")


def send_verification_email(
    to_email: str,
    token: str
) -> None:

    if not RESEND_API_KEY:
        raise RuntimeError(
            "RESEND_API_KEY is not configured."
        )

    if not EMAIL_FROM:
        raise RuntimeError(
            "EMAIL_FROM is not configured."
        )

    resend.api_key = RESEND_API_KEY

    verify_link = (
        f"{FRONTEND_URL}"
        f"/verify-email"
        f"?token={token}"
    )

    response = resend.Emails.send({

        "from": EMAIL_FROM,

        "to": [to_email],

        "subject":
            "Verify your email — AI Crack Detection",

        "text": (
            "Hi,\n\n"
            "Please verify your email by "
            "clicking the link below:\n\n"
            f"{verify_link}\n\n"
            "This link expires in 30 minutes "
            "and can only be used once.\n\n"
            "If you didn't request this, "
            "you can ignore this email.\n"
        )
    })

    print(
        "Verification email sent:",
        response
    )