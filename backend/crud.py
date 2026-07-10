from sqlalchemy.orm import Session

from models import InspectionHistory
from sqlalchemy import func
from datetime import datetime, timedelta

def create_inspection(
    db: Session,
    image_name: str,
    prediction: str,
    confidence: float,
    model_name: str,
    structure_type: str
):

    inspection = InspectionHistory(

        image_name=image_name,

        prediction=prediction,

        confidence=confidence,

        model_name=model_name,

        structure_type=structure_type

    )

    db.add(inspection)

    db.commit()

    db.refresh(inspection)

    return inspection


def get_all_inspections(db: Session):

    return db.query(
        InspectionHistory
    ).order_by(
        InspectionHistory.created_at.desc()
    ).all()


def delete_inspection(
    db: Session,
    inspection_id: int
):

    inspection = db.query(
        InspectionHistory
    ).filter(
        InspectionHistory.id == inspection_id
    ).first()

    if inspection:

        db.delete(inspection)

        db.commit()

    return inspection
def get_dashboard_stats(db: Session):
    total = db.query(InspectionHistory).count()
    crack = db.query(InspectionHistory).filter(InspectionHistory.prediction == "Crack").count()
    no_crack = db.query(InspectionHistory).filter(InspectionHistory.prediction == "No Crack").count()
    accuracy = 0
    if (total > 0):
        accuracy = round(max(crack,no_crack)/total * 100, 2)
    avg_confidence = (db.query(func.avg(InspectionHistory.confidence))).scalar()
    if avg_confidence is None:
        avg_confidence = 0

    max_confidence = (
        db.query(func.max(InspectionHistory.confidence))
        .scalar()
    )

    if max_confidence is None:
        max_confidence = 0

    today = datetime.utcnow().date()

    today_count = (
        db.query(InspectionHistory)
        .filter(
            func.date(InspectionHistory.created_at) == today
        )
        .count()
    )
    
    return {
        "total" : total,
        "crack": crack,
        "no_crack": no_crack,
        "accuracy": accuracy,
        "average_confidence": round(avg_confidence, 2),

        "highest_confidence": round(max_confidence, 2),

        "today_inspections": today_count
    }