from tensorflow.keras.models import load_model
import os
import json


# ============================================================
# BASE DIRECTORY
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)


# ============================================================
# AI-MODEL DIRECTORY
# ============================================================

AI_MODEL_DIR = os.path.join(
    BASE_DIR,
    "..",
    "ai-model"
)


MODEL_DIR = os.path.join(
    AI_MODEL_DIR,
    "models"
)


# ============================================================
# STRUCTURE CLASSIFIER
# ============================================================

STRUCTURE_MODEL_PATH = os.path.join(
    AI_MODEL_DIR,
    "structure_classifier.keras"
)

STRUCTURE_CLASSES_PATH = os.path.join(
    AI_MODEL_DIR,
    "structure_classes.json"
)


print("=" * 60)
print("LOADING STRUCTURE CLASSIFIER")
print("=" * 60)

if not os.path.exists(STRUCTURE_MODEL_PATH):

    raise FileNotFoundError(
        f"Structure classifier not found:\n"
        f"{STRUCTURE_MODEL_PATH}"
    )


STRUCTURE_MODEL = load_model(
    STRUCTURE_MODEL_PATH,
    compile=False
)


print(
    f"Loaded: {STRUCTURE_MODEL_PATH}"
)


# ============================================================
# LOAD STRUCTURE CLASS NAMES
# ============================================================

if not os.path.exists(STRUCTURE_CLASSES_PATH):

    raise FileNotFoundError(
        f"Structure classes file not found:\n"
        f"{STRUCTURE_CLASSES_PATH}"
    )


with open(
    STRUCTURE_CLASSES_PATH,
    "r"
) as file:

    STRUCTURE_CLASSES = json.load(file)


print(
    "Structure classes:",
    STRUCTURE_CLASSES
)


# ============================================================
# CRACK DETECTION MODELS
# ============================================================

print()
print("=" * 60)
print("LOADING CRACK DETECTION MODELS")
print("=" * 60)


MODELS = {

    "Pavement": load_model(
        os.path.join(
            MODEL_DIR,
            "best_model3.keras"
        ),
        compile=False
    ),

    "Wall": load_model(
        os.path.join(
            MODEL_DIR,
            "best_model3.keras"
        ),
        compile=False
    ),

    "Deck": load_model(
        os.path.join(
            MODEL_DIR,
            "best_model3.keras"
        ),
        compile=False
    )

}


print("Pavement model loaded.")
print("Wall model loaded.")
print("Deck model loaded.")

print()
print("=" * 60)
print("ALL AI MODELS LOADED SUCCESSFULLY")
print("=" * 60)