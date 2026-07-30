from fastapi import Depends, HTTPException

from models import User
from auth.jwt_handler import get_current_user


def get_verified_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Drop-in replacement for get_current_user on routes that should be
    blocked until the user has verified their email (e.g. /predict/,
    /history/, /dashboard/stats, /report/{id} in main.py).

    Usage: swap `Depends(get_current_user)` -> `Depends(get_verified_user)`
    on whichever routes in main.py you want gated.
    """

    if not current_user.is_verified:
        raise HTTPException(
            status_code=403,
            detail="Please verify your email before accessing this feature."
        )

    return current_user