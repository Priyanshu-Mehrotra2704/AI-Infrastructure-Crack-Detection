from pydantic import BaseModel
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