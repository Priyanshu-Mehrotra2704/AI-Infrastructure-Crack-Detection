import os
import cv2
import numpy as np

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Depends,
    HTTPException
)

from fastapi.responses import FileResponse

from fastapi.middleware.cors import CORSMiddleware

from fastapi.staticfiles import StaticFiles

from sqlalchemy.orm import Session


# ============================================================
# DATABASE / MODELS
# ============================================================

from database import (
    get_db,
    Base,
    engine
)

from models import (
    User,
    InspectionHistory
)


# ============================================================
# AUTH
# ============================================================

from auth.auth_routes import (
    router as auth_router
)

from auth.jwt_handler import (
    get_current_user
)


# ============================================================
# CRUD
# ============================================================

from crud import (
    create_inspection,
    get_all_inspections,
    delete_inspection,
    get_dashboard_stats
)


# ============================================================
# REPORT
# ============================================================

from reports.report_generator import (
    generate_report
)


# ============================================================
# AI MODELS
# ============================================================

from model_loader import (
    MODELS,
    STRUCTURE_MODEL,
    STRUCTURE_CLASSES
)

from runtime_paths import (
    HEATMAP_DIR,
    UPLOAD_DIR,
    ensure_runtime_directories,
)


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

Base.metadata.create_all(
    bind=engine
)


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI()


# ============================================================
# AUTH ROUTES
# ============================================================

app.include_router(
    auth_router
)


# ============================================================
# GRADCAM DIRECTORY
# ============================================================

ensure_runtime_directories()


app.mount(
    "/generated_heatmaps",
    StaticFiles(
        directory=str(HEATMAP_DIR)
    ),
    name="generated_heatmaps"
)


# ============================================================
# CORS
# ============================================================

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,https://crackwatch.vercel.app",
    ).split(",")
    if origin.strip()
]


app.add_middleware(
    CORSMiddleware,

    allow_origins=CORS_ORIGINS,

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# IMAGE CONFIGURATION
# ============================================================

IMG_SIZE = 224


# ============================================================
# STRUCTURE CONFIGURATION
# ============================================================

STRUCTURE_CONFIDENCE_THRESHOLD = 0.70


STRUCTURE_MODEL_MAPPING = {

    "pavement": "Pavement",

    "wall": "Wall",

    "bridge_deck": "Deck",

    "bridge deck": "Deck",

    "deck": "Deck"

}


# ============================================================
# CRACK DETECTION THRESHOLDS
# ============================================================

THRESHOLDS = {

    "Pavement": 0.5,

    "Wall": 0.5,

    "Deck": 0.3,

}


# ============================================================
# HELPER:
# NORMALIZE STRUCTURE NAME
# ============================================================

def normalize_structure_name(
    structure_name
):

    normalized = (
        structure_name
        .strip()
        .lower()
        .replace("-", "_")
    )

    return normalized


# ============================================================
# HELPER:
# AUTOMATIC STRUCTURE DETECTION
# ============================================================

def detect_structure(
    image
):

    """
    Detect whether the image belongs to:

    pavement
    wall
    bridge_deck
    """

    # Structure classifier expects
    # images in the same 0-255 range used
    # during training.

    resized = cv2.resize(
        image,
        (IMG_SIZE, IMG_SIZE)
    )

    structure_input = (
        resized
        .astype("float32")
    )

    structure_input = np.expand_dims(
        structure_input,
        axis=0
    )


    prediction = STRUCTURE_MODEL.predict(
        structure_input,
        verbose=0
    )[0]


    predicted_index = int(
        np.argmax(prediction)
    )


    structure_confidence = float(
        prediction[predicted_index]
    )


    structure_name = STRUCTURE_CLASSES[
        predicted_index
    ]


    return (
        structure_name,
        structure_confidence,
        prediction
    )


# ============================================================
# HELPER:
# SELECT CRACK MODEL
# ============================================================

def get_crack_model(
    structure_name
):

    normalized = normalize_structure_name(
        structure_name
    )


    model_name = STRUCTURE_MODEL_MAPPING.get(
        normalized
    )


    if model_name is None:

        return None, None


    selected_model = MODELS.get(
        model_name
    )


    return (
        model_name,
        selected_model
    )


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {
        "message":
        "Welcome to the Image Classification API!"
    }


# ============================================================
# AUTOMATIC PREDICTION
# ============================================================

@app.post("/predict/")
async def predict(

    files: list[UploadFile] = File(...),

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    results = []


    # ========================================================
    # PROCESS EVERY IMAGE
    # ========================================================

    for file in files:

        # Never use a client-provided path as a filesystem path.
        filename = os.path.basename(file.filename or "upload")

        try:

            # ------------------------------------------------
            # READ IMAGE
            # ------------------------------------------------

            contents = await file.read()


            if not contents:

                results.append({

                    "filename": filename,

                    "prediction":
                    "Invalid Image",

                    "confidence": 0,

                    "structure":
                    "Unknown",

                    "structure_confidence":
                    0,

                    "model_name":
                    "None",

                    "heatmap": None,

                    "error":
                    "Empty image file."

                })

                continue


            # ------------------------------------------------
            # SAVE IMAGE
            # ------------------------------------------------

            image_path = UPLOAD_DIR / filename


            with open(
                image_path,
                "wb"
            ) as f:

                f.write(contents)


            # ------------------------------------------------
            # DECODE IMAGE
            # ------------------------------------------------

            nparr = np.frombuffer(
                contents,
                np.uint8
            )


            img = cv2.imdecode(
                nparr,
                cv2.IMREAD_COLOR
            )


            if img is None:

                results.append({

                    "filename":
                    filename,

                    "prediction":
                    "Invalid Image",

                    "confidence": 0,

                    "structure":
                    "Unknown",

                    "structure_confidence":
                    0,

                    "model_name":
                    "None",

                    "heatmap": None,

                    "error":
                    "Could not decode image."

                })

                continue


            # Convert BGR → RGB

            img_rgb = cv2.cvtColor(
                img,
                cv2.COLOR_BGR2RGB
            )


            # =================================================
            # STEP 1:
            # AUTOMATIC STRUCTURE DETECTION
            # =================================================

            (
                detected_structure,
                structure_confidence,
                structure_probabilities
            ) = detect_structure(
                img_rgb
            )


            structure_confidence_percent = round(
                structure_confidence * 100,
                2
            )


            print()
            print(
                f"Image: {filename}"
            )

            print(
                f"Detected structure: "
                f"{detected_structure}"
            )

            print(
                f"Structure confidence: "
                f"{structure_confidence_percent}%"
            )


            # =================================================
            # STEP 2:
            # CHECK STRUCTURE CONFIDENCE
            # =================================================

            if (
                structure_confidence
                < STRUCTURE_CONFIDENCE_THRESHOLD
            ):

                print(
                    "Structure confidence too low."
                )


                results.append({

                    "filename":
                    filename,

                    "prediction":
                    "Structure Uncertain",

                    "confidence": 0,

                    "structure":
                    detected_structure,

                    "structure_confidence":
                    structure_confidence_percent,

                    "model_name":
                    "Structure Classifier",

                    "heatmap": None,

                    "error":
                    "Unable to confidently identify "
                    "the infrastructure type."

                })

                continue


            # =================================================
            # STEP 3:
            # SELECT CRACK MODEL AUTOMATICALLY
            # =================================================

            (
                selected_model_name,
                selected_model
            ) = get_crack_model(
                detected_structure
            )


            if selected_model is None:

                results.append({

                    "filename":
                    filename,

                    "prediction":
                    "Structure Unsupported",

                    "confidence": 0,

                    "structure":
                    detected_structure,

                    "structure_confidence":
                    structure_confidence_percent,

                    "model_name":
                    "None",

                    "heatmap": None,

                    "error":
                    f"No crack model is configured "
                    f"for structure: "
                    f"{detected_structure}"

                })

                continue


            print(
                f"Selected crack model: "
                f"{selected_model_name}"
            )


            # =================================================
            # STEP 4:
            # PREPARE IMAGE FOR CRACK MODEL
            # =================================================

            crack_img = cv2.resize(
                img_rgb,
                (IMG_SIZE, IMG_SIZE)
            )


            crack_img = (
                crack_img
                .astype("float32")
                / 255.0
            )


            crack_img = np.expand_dims(
                crack_img,
                axis=0
            )


            # =================================================
            # STEP 5:
            # CRACK PREDICTION
            # =================================================

            prediction = selected_model.predict(
                crack_img,
                verbose=0
            )


            raw_confidence = float(
                prediction[0][0]
            )


            # =================================================
            # STEP 6:
            # STRUCTURE-SPECIFIC THRESHOLD
            # =================================================

            threshold = THRESHOLDS.get(
                selected_model_name,
                0.5
            )


            if raw_confidence >= threshold:

                result = "Crack"

                crack_confidence = (
                    raw_confidence * 100
                )

            else:

                result = "No Crack"

                crack_confidence = (
                    (1 - raw_confidence) * 100
                )


            crack_confidence = round(
                crack_confidence,
                2
            )


            # =================================================
            # GRADCAM
            # =================================================

            heatmap = None

            heatmap_path = None


            # GradCAM remains disabled for now.


            # =================================================
            # SAVE INSPECTION
            # =================================================

            create_inspection(

                db=db,

                image_name=filename,

                prediction=result,

                confidence=crack_confidence,

                model_name="CNN",

                structure_type=selected_model_name,

                user_id=current_user.id

            )


            # =================================================
            # RETURN RESULT
            # =================================================

            results.append({

                "filename":
                filename,

                "prediction":
                result,

                "confidence":
                crack_confidence,

                "structure":
                selected_model_name,

                "structure_confidence":
                structure_confidence_percent,

                "model_name":
                "CNN",

                "heatmap":
                None

            })


        except Exception as error:

            print(
                f"Error processing "
                f"{filename}: "
                f"{error}"
            )


            results.append({

                "filename":
                filename,

                "prediction":
                "Processing Error",

                "confidence":
                0,

                "structure":
                "Unknown",

                "structure_confidence":
                0,

                "model_name":
                "None",

                "heatmap":
                None,

                "error":
                str(error)

            })


    # ========================================================
    # FINAL RESPONSE
    # ========================================================

    return {

        "total_images":
        len(results),

        "results":
        results

    }


# ============================================================
# HISTORY
# ============================================================

@app.get("/history/")
def history(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    return get_all_inspections(
        db,
        current_user.id
    )


# ============================================================
# DELETE HISTORY
# ============================================================

@app.delete("/history/{inspection_id}/")
def delete_history(

    inspection_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    inspection = delete_inspection(

        db,

        inspection_id,

        current_user.id

    )


    if inspection is None:

        raise HTTPException(

            status_code=404,

            detail=
            "Inspection not found."

        )


    return {

        "message":
        "Deleted Successfully"

    }


# ============================================================
# DASHBOARD
# ============================================================

@app.get("/dashboard/stats")
def dashboard_stats(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    return get_dashboard_stats(
        db,
        current_user.id
    )


# ============================================================
# REPORT
# ============================================================

@app.get("/report/{inspection_id}")
def download_report(

    inspection_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    inspection = (

        db.query(
            InspectionHistory
        )

        .filter(

            InspectionHistory.id
            == inspection_id,

            InspectionHistory.user_id
            == current_user.id

        )

        .first()

    )


    if inspection is None:

        raise HTTPException(

            status_code=404,

            detail=
            "Inspection not found."

        )


    data = {

        "id":
        inspection.id,

        "filename":
        inspection.image_name,

        "prediction":
        inspection.prediction,

        "confidence":
        inspection.confidence,

        "structure":
        inspection.structure_type,

        "model_name":
        inspection.model_name,

        "image_path":
        str(UPLOAD_DIR / os.path.basename(inspection.image_name))

    }


    pdf_path = generate_report(
        data
    )


    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=os.path.basename(
            pdf_path
        )
    )