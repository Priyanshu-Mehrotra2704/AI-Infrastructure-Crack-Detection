import os
import json
import numpy as np
import tensorflow as tf

from tensorflow.keras import layers, models
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.callbacks import (
    EarlyStopping,
    ModelCheckpoint,
    ReduceLROnPlateau
)

# ============================================================
# CONFIGURATION
# ============================================================

IMG_SIZE = 224
BATCH_SIZE = 16
EPOCHS = 15
SEED = 42

DATASET_DIR = "ai-model/structure_dataset"

MODEL_PATH = "ai-model/structure_classifier.keras"
CLASS_NAMES_PATH = "ai-model/structure_classes.json"


# ============================================================
# GPU / MEMORY CONFIGURATION
# ============================================================

print("=" * 60)
print("CHECKING GPU")
print("=" * 60)

gpus = tf.config.list_physical_devices("GPU")

if gpus:
    print("GPU detected:", gpus)

    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(
                gpu,
                True
            )
        print("GPU memory growth enabled.")

    except RuntimeError as error:
        print("GPU configuration error:", error)

else:
    print("No GPU detected.")
    print("Training will use CPU.")

print()


# ============================================================
# LOAD DATASET
# ============================================================

print("=" * 60)
print("LOADING DATASET")
print("=" * 60)

train_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,

    validation_split=0.20,

    subset="training",

    seed=SEED,

    image_size=(IMG_SIZE, IMG_SIZE),

    batch_size=BATCH_SIZE,

    label_mode="int",

    shuffle=True
)


val_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,

    validation_split=0.20,

    subset="validation",

    seed=SEED,

    image_size=(IMG_SIZE, IMG_SIZE),

    batch_size=BATCH_SIZE,

    label_mode="int",

    shuffle=False
)


# ============================================================
# CLASS NAMES
# ============================================================

class_names = train_ds.class_names

print()
print("Classes:")
print(class_names)

print()
print("Number of classes:", len(class_names))

if len(class_names) != 3:

    raise ValueError(
        "Expected exactly 3 classes: "
        "pavement, wall, bridge_deck"
    )


# Save class names
with open(CLASS_NAMES_PATH, "w") as file:

    json.dump(
        class_names,
        file,
        indent=4
    )

print()
print(
    f"Class names saved to: "
    f"{CLASS_NAMES_PATH}"
)


# ============================================================
# DATA PERFORMANCE
# ============================================================

AUTOTUNE = tf.data.AUTOTUNE

train_ds = train_ds.prefetch(
    AUTOTUNE
)

val_ds = val_ds.prefetch(
    AUTOTUNE
)


# ============================================================
# DATA AUGMENTATION
# ============================================================

data_augmentation = tf.keras.Sequential(
    [

        layers.RandomFlip(
            "horizontal"
        ),

        layers.RandomRotation(
            0.08
        ),

        layers.RandomZoom(
            0.10
        ),

        layers.RandomContrast(
            0.10
        ),

    ],

    name="data_augmentation"
)


# ============================================================
# BASE MODEL
# ============================================================

print()
print("=" * 60)
print("CREATING EFFICIENTNETB0")
print("=" * 60)

base_model = EfficientNetB0(
    weights="imagenet",

    include_top=False,

    input_shape=(
        IMG_SIZE,
        IMG_SIZE,
        3
    )
)


# Freeze pretrained layers initially

base_model.trainable = False


# ============================================================
# BUILD CLASSIFIER
# ============================================================

inputs = layers.Input(
    shape=(
        IMG_SIZE,
        IMG_SIZE,
        3
    )
)


x = data_augmentation(inputs)


# EfficientNetB0 already contains its preprocessing
# internally, so we do NOT add Rescaling(1./255) here.

x = base_model(
    x,
    training=False
)


x = layers.GlobalAveragePooling2D()(x)


x = layers.Dropout(
    0.30
)(x)


x = layers.Dense(
    128,
    activation="relu"
)(x)


x = layers.Dropout(
    0.20
)(x)


outputs = layers.Dense(
    3,
    activation="softmax"
)(x)


model = models.Model(
    inputs,
    outputs
)


# ============================================================
# COMPILE
# ============================================================

model.compile(

    optimizer=tf.keras.optimizers.Adam(
        learning_rate=0.001
    ),

    loss="sparse_categorical_crossentropy",

    metrics=[
        "accuracy"
    ]
)


# ============================================================
# MODEL SUMMARY
# ============================================================

model.summary()


# ============================================================
# CALLBACKS
# ============================================================

checkpoint = ModelCheckpoint(

    MODEL_PATH,

    monitor="val_accuracy",

    mode="max",

    save_best_only=True,

    verbose=1
)


early_stopping = EarlyStopping(

    monitor="val_accuracy",

    mode="max",

    patience=4,

    restore_best_weights=True,

    verbose=1
)


reduce_lr = ReduceLROnPlateau(

    monitor="val_loss",

    factor=0.5,

    patience=2,

    min_lr=1e-6,

    verbose=1
)


# ============================================================
# TRAIN
# ============================================================

print()
print("=" * 60)
print("STARTING TRAINING")
print("=" * 60)

history = model.fit(

    train_ds,

    validation_data=val_ds,

    epochs=EPOCHS,

    callbacks=[
        checkpoint,
        early_stopping,
        reduce_lr
    ]
)


# ============================================================
# FINAL VALIDATION
# ============================================================

print()
print("=" * 60)
print("FINAL VALIDATION")
print("=" * 60)

loss, accuracy = model.evaluate(
    val_ds,
    verbose=1
)

print()
print(
    f"Validation Loss: {loss:.4f}"
)

print(
    f"Validation Accuracy: "
    f"{accuracy * 100:.2f}%"
)


# ============================================================
# SAVE FINAL MODEL
# ============================================================

model.save(
    MODEL_PATH
)

print()
print("=" * 60)
print("TRAINING COMPLETE")
print("=" * 60)

print()
print(
    f"Model saved to: "
    f"{os.path.abspath(MODEL_PATH)}"
)

print(
    f"Classes saved to: "
    f"{os.path.abspath(CLASS_NAMES_PATH)}"
)

print()
print("Classes:")

for index, class_name in enumerate(class_names):

    print(
        f"{index} -> {class_name}"
    )

print()
print("You can now test the model.")