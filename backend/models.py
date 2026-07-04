from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func

from database import Base


class InspectionHistory(Base):

    __tablename__ = "inspection_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    image_name = Column(
        String,
        nullable=False
    )

    prediction = Column(
        String,
        nullable=False
    )

    confidence = Column(
        Float,
        nullable=False
    )

    model_name = Column(
        String
    )

    structure_type = Column(
        String
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )