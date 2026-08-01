from tensorflow.keras.models import load_model
import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS = {
    "Pavement": load_model(
        os.path.join(
            BASE_DIR,
            "..",
            "ai-model",
            "models",
            "best_model3.keras"
        ),
        compile=False
    ),

    "Wall": load_model(
        os.path.join(
            BASE_DIR,
            "..",
            "ai-model",
            "models",
            "wall_best_model.keras"
        ),
        compile=False
    ),

    "Deck": load_model(
        os.path.join(
            BASE_DIR,
            "..",
            "ai-model",
            "models",
            "deck_best_model_focal.keras"
        ),
        compile=False
    )
}