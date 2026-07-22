import tensorflow as tf
from tensorflow.keras.layers import (
    Input,
    RandomFlip,
    RandomRotation,
    RandomZoom,
    Rescaling,
    GlobalAveragePooling2D,
    Dense,
    Dropout,
)
from tensorflow.keras.models import Model
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import (
    ModelCheckpoint,
    EarlyStopping,
    ReduceLROnPlateau,
)
from tensorflow.keras.regularizers import l2

from wall_data_pipeline import load_dataset

# =====================================================
# Load Dataset
# =====================================================

X_train, X_test, y_train, y_test = load_dataset()

# =====================================================
# Base Model
# =====================================================

base_model = MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights="imagenet"
)

base_model.trainable = False

# =====================================================
# Build Model
# =====================================================


inputs = Input(shape=(224, 224, 3))

x = RandomFlip("horizontal")(inputs)
x = RandomRotation(0.03)(x)
x = RandomZoom(0.05)(x)

# Convert [0,1] -> [-1,1]
x = Rescaling(scale=2.0, offset=-1)(x)

# Keep BatchNorm frozen
x = base_model(x, training=False)

x = GlobalAveragePooling2D()(x)

x = Dense(512, activation="relu", kernel_regularizer=l2(1e-4))(x)
x = Dropout(0.3)(x)

outputs = Dense(1, activation="sigmoid")(x)

model = Model(inputs, outputs)

# =====================================================
# Phase 1
# =====================================================

model.compile(
    optimizer=Adam(5e-4),
    loss="binary_crossentropy",
    metrics=["accuracy"]
)

checkpoint = ModelCheckpoint(
    "models/wall_best_model.keras",
    monitor="val_accuracy",
    save_best_only=True,
    verbose=1
)

early_stop = EarlyStopping(
    monitor="val_loss",
    patience=8,
    restore_best_weights=True
)

reduce_lr = ReduceLROnPlateau(
    monitor="val_loss",
    factor=0.5,
    patience=4,
    min_lr=1e-7,
    verbose=1
)

print("\n========== Phase 1 ==========\n")

history1 = model.fit(
    X_train,
    y_train,
    validation_data=(X_test, y_test),
    epochs=50,
    batch_size=32,
    callbacks=[checkpoint, early_stop, reduce_lr],
    verbose=2
)

# =====================================================
# Phase 2 Fine Tuning
# =====================================================

print("\n========== Phase 2 ==========\n")

base_model.trainable = True

# Freeze all except last 30 layers
for layer in base_model.layers[:-30]:
    layer.trainable = False

# Keep BatchNormalization layers frozen
for layer in base_model.layers:
    if isinstance(layer, tf.keras.layers.BatchNormalization):
        layer.trainable = False

model.compile(
    optimizer=Adam(1e-5),
    loss="binary_crossentropy",
    metrics=["accuracy"]
)

checkpoint2 = ModelCheckpoint(
    "models/wall_best_model.keras",
    monitor="val_accuracy",
    save_best_only=True,
    verbose=1
)

early_stop2 = EarlyStopping(
    monitor="val_loss",
    patience=6,
    restore_best_weights=True
)

reduce_lr2 = ReduceLROnPlateau(
    monitor="val_loss",
    factor=0.5,
    patience=3,
    min_lr=1e-8,
    verbose=1
)

history2 = model.fit(
    X_train,
    y_train,
    validation_data=(X_test, y_test),
    epochs=30,
    batch_size=32,
    callbacks=[checkpoint2, early_stop2, reduce_lr2],
    verbose=2
)

# =====================================================
# Save Final Model
# =====================================================

model.save("models/wall_model.keras")

loss, accuracy = model.evaluate(X_test, y_test, verbose=0)

print("\n===============================")
print(f"Final Test Accuracy : {accuracy*100:.2f}%")
print(f"Final Test Loss     : {loss:.4f}")
print("===============================")