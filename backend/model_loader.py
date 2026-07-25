import os
from tensorflow.keras.models import load_model

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODELS = {

    "Pavement": load_model(
        os.path.join(
            BASE_DIR,
            "..",
            "ai-model",
            "models",
            "best_model3.keras"
        )
    ),

    "Wall": load_model(
        os.path.join(
            BASE_DIR,
            "..",
            "ai-model",
            "models",
            "wall_best_model.keras"
        )
    ),

    "Deck": load_model(
        os.path.join(
            BASE_DIR,
            "..",
            "ai-model",
            "models",
            "deck_best_model_focal.keras"
        )
    )

}


