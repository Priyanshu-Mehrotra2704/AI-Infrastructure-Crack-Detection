import os
import json
import gc

from tensorflow.keras.models import load_model


# ============================================================
# BASE DIRECTORIES
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

AI_MODEL_DIR = os.path.abspath(
    os.path.join(
        BASE_DIR,
        "..",
        "ai-model"
    )
)

MODEL_DIR = os.path.join(
    AI_MODEL_DIR,
    "models"
)


# ============================================================
# MODEL PATHS
# ============================================================

STRUCTURE_MODEL_PATH = os.path.join(
    AI_MODEL_DIR,
    "structure_classifier.keras"
)

STRUCTURE_CLASSES_PATH = os.path.join(
    AI_MODEL_DIR,
    "structure_classes.json"
)


CRACK_MODEL_PATHS = {

    "Pavement": os.path.join(
        MODEL_DIR,
        "best_model3.keras"
    ),

    "Wall": os.path.join(
        MODEL_DIR,
        "wall_best_model.keras"
    ),

    "Deck": os.path.join(
        MODEL_DIR,
        "deck_best_model.keras"
    )

}


# ============================================================
# STRUCTURE CLASSIFIER
# ============================================================

STRUCTURE_MODEL = None
STRUCTURE_CLASSES = None


# ============================================================
# CRACK MODEL CACHE
# ============================================================

CRACK_MODEL = None
CURRENT_CRACK_MODEL_NAME = None


# ============================================================
# LOAD STRUCTURE CLASSIFIER
# ============================================================

def get_structure_model():

    global STRUCTURE_MODEL

    if STRUCTURE_MODEL is None:

        print("=" * 60)
        print("LOADING STRUCTURE CLASSIFIER")
        print("=" * 60)

        if not os.path.exists(
            STRUCTURE_MODEL_PATH
        ):
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

    return STRUCTURE_MODEL


# ============================================================
# LOAD STRUCTURE CLASSES
# ============================================================

def get_structure_classes():

    global STRUCTURE_CLASSES

    if STRUCTURE_CLASSES is None:

        if not os.path.exists(
            STRUCTURE_CLASSES_PATH
        ):
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

    return STRUCTURE_CLASSES


# ============================================================
# LOAD ONLY REQUIRED CRACK MODEL
# ============================================================

def get_crack_model(
    structure_name
):

    global CRACK_MODEL
    global CURRENT_CRACK_MODEL_NAME

    if structure_name not in CRACK_MODEL_PATHS:

        raise ValueError(
            f"Unsupported structure: "
            f"{structure_name}"
        )

    model_path = CRACK_MODEL_PATHS[
        structure_name
    ]


    # --------------------------------------------------------
    # Already loaded requested model
    # --------------------------------------------------------

    if (
        CRACK_MODEL is not None
        and
        CURRENT_CRACK_MODEL_NAME == structure_name
    ):

        return CRACK_MODEL


    # --------------------------------------------------------
    # Remove previously loaded crack model
    # --------------------------------------------------------

    if CRACK_MODEL is not None:

        print(
            f"Unloading previous crack model: "
            f"{CURRENT_CRACK_MODEL_NAME}"
        )

        del CRACK_MODEL

        CRACK_MODEL = None

        CURRENT_CRACK_MODEL_NAME = None

        gc.collect()


    # --------------------------------------------------------
    # Check model file
    # --------------------------------------------------------

    if not os.path.exists(
        model_path
    ):

        raise FileNotFoundError(
            f"Crack model not found:\n"
            f"{model_path}"
        )


    # --------------------------------------------------------
    # Load requested model
    # --------------------------------------------------------

    print("=" * 60)
    print(
        f"LOADING {structure_name.upper()} "
        f"CRACK MODEL"
    )
    print("=" * 60)

    CRACK_MODEL = load_model(
        model_path,
        compile=False
    )

    CURRENT_CRACK_MODEL_NAME = (
        structure_name
    )

    print(
        f"Loaded: {model_path}"
    )

    return CRACK_MODEL


# ============================================================
# BACKWARD-COMPATIBILITY HELPERS
# ============================================================

def get_model_for_structure(
    structure_name
):

    return get_crack_model(
        structure_name
    )