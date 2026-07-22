import tensorflow as tf
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import (
    Input, RandomFlip, RandomRotation, RandomZoom,
    RandomBrightness, RandomContrast, Rescaling,
    GlobalAveragePooling2D, Dense, Dropout
)
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.optimizers import Adam
from wall_data_pipeline import load_dataset

X_train, X_test, y_train, y_test = load_dataset()

# ---- Base model: MobileNetV2 pretrained on ImageNet ----
base_model = MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights="imagenet"
)
base_model.trainable = False   # freeze for phase 1

inputs = Input(shape=(224, 224, 3))

# Augmentation (training ke time hi active, inference pe skip)
x = RandomFlip("horizontal")(inputs)
x = RandomRotation(0.1)(x)
x = RandomZoom(0.1)(x)
x = RandomBrightness(0.1)(x)
x = RandomContrast(0.1)(x)

# wall_data_pipeline.py images ko [0,1] range me deta hai;
# MobileNetV2 [-1,1] range expect karta hai, isliye rescale
x = Rescaling(scale=2.0, offset=-1)(x)

x = base_model(x, training=False)
x = GlobalAveragePooling2D()(x)
x = Dense(128, activation="relu")(x)
x = Dropout(0.5)(x)
outputs = Dense(1, activation="sigmoid")(x)

model = Model(inputs, outputs)

model.compile(
    optimizer=Adam(learning_rate=0.0001),
    loss="binary_crossentropy",
    metrics=["accuracy"]
)

checkpoint = tf.keras.callbacks.ModelCheckpoint(
    "models/wall_best_model.keras",
    monitor="val_accuracy",
    save_best_only=True
)

early_stop = tf.keras.callbacks.EarlyStopping(
    monitor="val_loss",
    patience=5,
    restore_best_weights=True
)

reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(
    monitor="val_loss",
    factor=0.5,
    patience=3,
    min_lr=1e-6
)

# ---- Phase 1: train only the new top layers (base frozen) ----
model.fit(
    X_train, y_train,
    epochs=15,
    batch_size=32,
    validation_data=(X_test, y_test),
    verbose=2,
    callbacks=[checkpoint, early_stop, reduce_lr]
)

# ---- Phase 2: unfreeze base model, fine-tune with a tiny learning rate ----
base_model.trainable = True

model.compile(
    optimizer=Adam(learning_rate=1e-5),
    loss="binary_crossentropy",
    metrics=["accuracy"]
)

model.fit(
    X_train, y_train,
    epochs=15,
    batch_size=32,
    validation_data=(X_test, y_test),
    verbose=2,
    callbacks=[checkpoint, early_stop, reduce_lr]
)

model.save("models/wall_model.keras")