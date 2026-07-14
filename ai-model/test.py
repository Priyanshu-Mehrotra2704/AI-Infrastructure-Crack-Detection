import os
from tensorflow.keras.models import load_model

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "best_model.keras"
)

print(MODEL_PATH)

model = load_model(MODEL_PATH)

for layer in model.layers:
    print(layer.name)