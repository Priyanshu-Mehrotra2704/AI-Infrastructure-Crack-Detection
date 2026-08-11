import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
EMAIL_FROM = os.getenv("EMAIL_FROM", SMTP_USER)

FRONTEND_URL = os.getenv("FRONTEND_URL", "https://crack-watch.vercel.app")


def send_verification_email(to_email: str, token: str) -> None:
    """
    Sends the verification link. Runs as a FastAPI BackgroundTask so it
    doesn't block the register/resend response, and so smtplib's blocking
    calls don't block the event loop.
    """

    verify_link = f"{FRONTEND_URL}/verify-email?token={token}"

    subject = "Verify your email — AI Crack Detection"
    body = (
        "Hi,\n\n"
        "Please verify your email by clicking the link below:\n\n"
        f"{verify_link}\n\n"
        "This link expires in 30 minutes and can only be used once. "
        "If you didn't request this, you can ignore this email.\n"
    )

    msg = MIMEMultipart()
    msg["From"] = EMAIL_FROM
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(EMAIL_FROM, to_email, msg.as_string())