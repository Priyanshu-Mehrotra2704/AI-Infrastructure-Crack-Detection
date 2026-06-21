import os
import cv2
import numpy as np
from tensorflow.keras.models import load_model

# ====================================
# SETTINGS
# ====================================

IMG_SIZE = 224

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
print("Base Directory:", BASE_DIR)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "best_model.keras"
)


IMAGE_PATH = os.path.join(
    BASE_DIR,
    "test_images",
    "sample.jpg"
)

# ====================================
# DEBUG INFO
# ====================================


print("\nModels Folder Contents:")



print("\nChecking Model File...")

if not os.path.exists(MODEL_PATH):
    raise Exception(
        f"Model file not found:\n{MODEL_PATH}"
    )

print(
    "Model Size:",
    os.path.getsize(MODEL_PATH),
    "bytes"
)

# ====================================
# LOAD MODEL
# ====================================

print("\nLoading Model...")

model = load_model(MODEL_PATH)

print("Model Loaded Successfully!")



if not os.path.exists(IMAGE_PATH):
    raise Exception(
        f"Image not found:\n{IMAGE_PATH}"
    )

image = cv2.imread(IMAGE_PATH)

if image is None:
    raise Exception("Failed to read image")

image = cv2.cvtColor(
    image,
    cv2.COLOR_BGR2RGB
)

image = cv2.resize(
    image,
    (IMG_SIZE, IMG_SIZE)
)

image = image.astype(np.float32) / 255.0

image = np.expand_dims(
    image,
    axis=0
)

# ====================================
# PREDICTION
# ====================================

prediction = model.predict(image)

confidence = float(prediction[0][0])

print("\nRaw Prediction:", confidence)

# ====================================
# RESULT
# ====================================

if confidence > 0.5:

    print("\n=== RESULT ===")
    print("Crack Detected")
    print(
        f"Confidence: {confidence * 100:.2f}%"
    )

else:

    print("\n=== RESULT ===")
    print("No Crack Detected")
    print(
        f"Confidence: {(1 - confidence) * 100:.2f}%"
    )