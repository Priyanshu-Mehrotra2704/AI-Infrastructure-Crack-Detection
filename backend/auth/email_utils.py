import os
import smtplib

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from dotenv import load_dotenv


load_dotenv()


# ============================================================
# SMTP CONFIGURATION
# ============================================================

SMTP_HOST = os.getenv(
    "SMTP_HOST",
    "smtp.gmail.com"
)

SMTP_PORT = int(
    os.getenv(
        "SMTP_PORT",
        "587"
    )
)

SMTP_USER = os.getenv(
    "SMTP_USER"
)

SMTP_PASSWORD = os.getenv(
    "SMTP_PASSWORD"
)

EMAIL_FROM = os.getenv(
    "EMAIL_FROM",
    SMTP_USER
)


# ============================================================
# FRONTEND URL
# ============================================================

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
).rstrip("/")


# ============================================================
# SEND VERIFICATION EMAIL
# ============================================================

def send_verification_email(
    to_email: str,
    token: str
) -> None:

    print("=" * 60)
    print("STARTING VERIFICATION EMAIL")
    print("=" * 60)

    print("Recipient:", to_email)
    print("SMTP host:", SMTP_HOST)
    print("SMTP port:", SMTP_PORT)
    print(
        "SMTP user configured:",
        bool(SMTP_USER)
    )
    print(
        "SMTP password configured:",
        bool(SMTP_PASSWORD)
    )
    print(
        "Frontend URL:",
        FRONTEND_URL
    )


    # --------------------------------------------------------
    # Validate configuration
    # --------------------------------------------------------

    if not SMTP_USER:

        raise RuntimeError(
            "SMTP_USER is not configured."
        )


    if not SMTP_PASSWORD:

        raise RuntimeError(
            "SMTP_PASSWORD is not configured."
        )


    if not EMAIL_FROM:

        raise RuntimeError(
            "EMAIL_FROM is not configured."
        )


    # --------------------------------------------------------
    # Verification URL
    # --------------------------------------------------------

    verify_link = (
        f"{FRONTEND_URL}"
        f"/verify-email"
        f"?token={token}"
    )


    print(
        "Verification email prepared."
    )


    # --------------------------------------------------------
    # Email content
    # --------------------------------------------------------

    subject = (
        "Verify your email — "
        "AI Crack Detection"
    )


    body = (
        "Hi,\n\n"

        "Please verify your email by "
        "clicking the link below:\n\n"

        f"{verify_link}\n\n"

        "This link expires in 30 minutes "
        "and can only be used once.\n\n"

        "If you didn't request this, "
        "you can ignore this email.\n"
    )


    # --------------------------------------------------------
    # Create email
    # --------------------------------------------------------

    msg = MIMEMultipart()

    msg["From"] = EMAIL_FROM

    msg["To"] = to_email

    msg["Subject"] = subject

    msg.attach(
        MIMEText(
            body,
            "plain"
        )
    )


    # --------------------------------------------------------
    # Send email
    # --------------------------------------------------------

    try:

        print(
            "Connecting to SMTP server..."
        )

        with smtplib.SMTP(
            SMTP_HOST,
            SMTP_PORT,
            timeout=30
        ) as server:

            server.ehlo()

            print(
                "Starting TLS..."
            )

            server.starttls()

            server.ehlo()

            print(
                "Logging into SMTP..."
            )

            server.login(
                SMTP_USER,
                SMTP_PASSWORD
            )

            print(
                "Sending verification email..."
            )

            server.sendmail(
                EMAIL_FROM,
                to_email,
                msg.as_string()
            )


        print(
            "Verification email sent successfully."
        )

        print("=" * 60)


    except Exception as error:

        print("=" * 60)

        print(
            "VERIFICATION EMAIL FAILED"
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
