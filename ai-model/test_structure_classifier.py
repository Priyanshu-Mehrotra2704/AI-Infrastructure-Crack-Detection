import os
import json
import numpy as np
import tensorflow as tf

# ============================================================
# CONFIGURATION
# ============================================================

MODEL_PATH = "ai-model/structure_classifier.keras"
CLASS_NAMES_PATH = "ai-model/structure_classes.json"

IMG_SIZE = 224

# Put the image you want to test here
TEST_IMAGE = r"D:\AI-Infrastructure-Crack-Detection\ai-model\test_images\th.jpg"


# ============================================================
# LOAD MODEL
# ============================================================

print("=" * 60)
print("LOADING STRUCTURE CLASSIFIER")
print("=" * 60)

model = tf.keras.models.load_model(
    MODEL_PATH,
    compile=False
)

print("Model loaded successfully.")
print()


# ============================================================
# LOAD CLASS NAMES
# ============================================================

with open(CLASS_NAMES_PATH, "r") as file:
    class_names = json.load(file)

print("Classes:")

for index, class_name in enumerate(class_names):
    print(f"{index} -> {class_name}")

print()


# ============================================================
# CHECK TEST IMAGE
# ============================================================

if not os.path.exists(TEST_IMAGE):

    print("=" * 60)
    print("TEST IMAGE NOT FOUND")
    print("=" * 60)

    print()
    print(
        f"Put an image named '{TEST_IMAGE}' "
        "inside the ai-model folder."
    )

    print()
    print("Example:")
    print()
    print("ai-model/")
    print("├── test_structure_classifier.py")
    print("├── test_image.jpg  <-- put image here")
    print("└── ...")

    exit()


# ============================================================
# LOAD IMAGE
# ============================================================

print("=" * 60)
print("LOADING IMAGE")
print("=" * 60)

image = tf.keras.utils.load_img(
    TEST_IMAGE,
    target_size=(IMG_SIZE, IMG_SIZE)
)

image_array = tf.keras.utils.img_to_array(
    image
)

image_array = np.expand_dims(
    image_array,
    axis=0
)


# ============================================================
# PREDICTION
# ============================================================

print("Running prediction...")

prediction = model.predict(
    image_array,
    verbose=0
)[0]


# ============================================================
# RESULTS
# ============================================================

predicted_index = np.argmax(
    prediction
)

predicted_class = class_names[
    predicted_index
]

confidence = float(
    prediction[predicted_index]
)


print()
print("=" * 60)
print("PREDICTION RESULT")
print("=" * 60)

print()

print(
    f"Predicted Structure : "
    f"{predicted_class}"
)

print(
    f"Confidence          : "
    f"{confidence * 100:.2f}%"
)

print()

print("All probabilities:")

for index, class_name in enumerate(class_names):

    probability = prediction[index] * 100

    print(
        f"{class_name:15} : "
        f"{probability:.2f}%"
    )

print()

print("=" * 60)