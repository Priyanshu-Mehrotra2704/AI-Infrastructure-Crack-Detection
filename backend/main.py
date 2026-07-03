import os
import cv2
import numpy as np
from tensorflow.keras.models import load_model
from fastapi import FastAPI, UploadFile, File, Depends
from sqlalchemy.orm import Session
from database import get_db
from crud import create_inspection
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR,"..", "ai-model", "models", "best_model.keras")
print("Model Path:", MODEL_PATH)
print("Loading Model...")
model = load_model(MODEL_PATH)
print("Model Loaded Successfully!")

IMG_SIZE = 224

@app.get("/")
def home():
    return {"message": "Welcome to the Image Classification API!"}

@app.post("/predict/")
async def predict(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = img.astype("float32") / 255.0
    img = np.expand_dims(img, axis=0)
    prediction = model.predict(img, verbose=0)
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
        model_name="EfficientNetB0",
        structure_type="Pavement"
    )
    return {"result": result, "confidence": confidence}


