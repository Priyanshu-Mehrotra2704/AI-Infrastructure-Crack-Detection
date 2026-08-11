
import os

from dotenv import load_dotenv
from brevo import Brevo
from brevo.transactional_emails import (
    SendTransacEmailRequestSender,
    SendTransacEmailRequestToItem,
)

load_dotenv()


BREVO_API_KEY = os.getenv("BREVO_API_KEY")

EMAIL_FROM = os.getenv("EMAIL_FROM")

EMAIL_FROM_NAME = os.getenv(
    "EMAIL_FROM_NAME",
    "AI Crack Detection"
)

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
).rstrip("/")


def send_verification_email(
    to_email: str,
    token: str
) -> None:

    print("=" * 60)
    print("STARTING VERIFICATION EMAIL")
    print("=" * 60)

    print("Recipient:", to_email)
    print(
        "Brevo API configured:",
        bool(BREVO_API_KEY)
    )
    print(
        "Email sender:",
        EMAIL_FROM
    )
    print(
        "Frontend URL:",
        FRONTEND_URL
    )

    if not BREVO_API_KEY:
        raise RuntimeError(
            "BREVO_API_KEY is not configured."
        )

    if not EMAIL_FROM:
        raise RuntimeError(
            "EMAIL_FROM is not configured."
        )

    verify_link = (
        f"{FRONTEND_URL}"
        f"/verify-email"
        f"?token={token}"
    )

    subject = (
        "Verify your email — "
        "AI Crack Detection"
    )

    text_content = (
        "Hi,\n\n"
        "Please verify your email by "
        "clicking the link below:\n\n"
        f"{verify_link}\n\n"
        "This link expires in 30 minutes "
        "and can only be used once.\n\n"
        "If you didn't request this, "
        "you can ignore this email.\n"
    )

    client = Brevo(
        api_key=BREVO_API_KEY
    )

    try:

        response = (
            client
            .transactional_emails
            .send_transac_email(
                subject=subject,

                text_content=text_content,

                sender=(
                    SendTransacEmailRequestSender(
                        email=EMAIL_FROM,
                        name=EMAIL_FROM_NAME,
                    )
                ),

                to=[
                    SendTransacEmailRequestToItem(
                        email=to_email
                    )
                ],
            )
        )

        print(
            "Verification email sent."
        )

        print(
            "Brevo message ID:",
            response.message_id
        )

        print("=" * 60)

    except Exception as error:

        print("=" * 60)
        print(
            "BREVO EMAIL FAILED"
        )
        print(
            "Error type:",
            type(error).__name__
        )
        print(
            "Error:",
            str(error)
        )
        print("=" * 60)

        raise
