import cv2
import numpy as np
from models import InspectionHistory
from fastapi import FastAPI, UploadFile, File, Depends, Form
from fastapi.responses import FileResponse
from reports.report_generator import generate_report
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from gradcam.gradcam import (make_gradcam_heatmap,save_gradcam)
import os
from fastapi.staticfiles import StaticFiles
from database import get_db
from crud import (
    create_inspection,
    get_all_inspections,
    delete_inspection,
    get_dashboard_stats
)
from model_loader import MODELS

app = FastAPI()

os.makedirs("gradcam/generated_heatmaps", exist_ok=True)

app.mount(
    "/generated_heatmaps",
    StaticFiles(directory="gradcam/generated_heatmaps"),
    name="generated_heatmaps"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

IMG_SIZE = 224


@app.get("/")
def home():
    return {
        "message": "Welcome to the Image Classification API!"
    }


@app.post("/predict/")
async def predict(
    files: list[UploadFile] = File(...),
    model: str = Form(...),
    db: Session = Depends(get_db)
):

    selected_model = MODELS.get(model)
    if selected_model is None:
        return {
            "error": "Invalid model selected."
        }

    results = []

    for file in files:

        contents = await file.read()
        UPLOAD_DIR = "uploaded_images"

        os.makedirs(UPLOAD_DIR, exist_ok=True)

        image_path = os.path.join(
            UPLOAD_DIR,
            file.filename
        )

        with open(image_path, "wb") as f:
            f.write(contents)

        nparr = np.frombuffer(contents, np.uint8)

        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            continue

        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))

        img = img.astype("float32") / 255.0

        img = np.expand_dims(img, axis=0)

        prediction = selected_model.predict(img,verbose=0)
        # -------- GradCAM Disabled --------

        heatmap = None

        heatmap_path = None

        # heatmap = make_gradcam_heatmap(img, selected_model)

        # name = os.path.splitext(file.filename)[0]

        # heatmap_path = os.path.join(
        #     "gradcam",
        #     "generated_heatmaps",
        #     f"{name}_heatmap.jpg"
        # )

        # save_gradcam(
        #     image_path,
        #     heatmap,
        #     heatmap_path
        # )

        confidence = float(prediction[0][0])

        if confidence >= 0.5:

            result = "Crack"

            confidence = round(confidence * 100, 2)

        else:

            result = "No Crack"

            confidence = round((1 - confidence) * 100, 2)

        create_inspection(

            db=db,

            image_name=file.filename,

            prediction=result,

            confidence=confidence,

            model_name="CNN",

            structure_type=model,
            

        )

        results.append({

            "filename": file.filename,

            "prediction": result,

            "confidence": confidence,

            "structure": model,

            "model_name": "CNN",
            "heatmap": None

        })

    return {

        "total_images": len(results),

        "results": results

    }


@app.get("/history/")
def history(db: Session = Depends(get_db)):
    return get_all_inspections(db)


@app.delete("/history/{inspection_id}/")
def delete_history(
    inspection_id: int,
    db: Session = Depends(get_db)
):

    inspection = delete_inspection(db, inspection_id)

    if inspection is None:

        return {
            "message": "Inspection not found"
        }

    return {
        "message": "Deleted Successfully"
    }


@app.get("/dashboard/stats")
def dashboard_stats(db: Session = Depends(get_db)):
    return get_dashboard_stats(db)

@app.get("/report/{inspection_id}")
def download_report(
    inspection_id: int,
    db: Session = Depends(get_db)
):

    inspection = (
        db.query(InspectionHistory)
        .filter(InspectionHistory.id == inspection_id)
        .first()
    )

    if inspection is None:

        return {
            "message": "Inspection not found."
        }

    data = {
        "id": inspection.id,
        "filename": inspection.image_name,
        "prediction": inspection.prediction,
        "confidence": inspection.confidence,
        "structure": inspection.structure_type,
        "model_name": inspection.model_name,
        "image_path": os.path.join(
            "uploaded_images",
            inspection.image_name
        )
    }

    pdf_path = generate_report(data)

    return FileResponse(

        pdf_path,

        media_type="application/pdf",

        filename=f"{inspection.image_name}.pdf"

    )