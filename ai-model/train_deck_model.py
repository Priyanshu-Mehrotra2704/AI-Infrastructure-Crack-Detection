import numpy as np
import tensorflow as tf
from tensorflow.keras.layers import (
    Input,
    RandomFlip,
    RandomRotation,
    RandomZoom,
    RandomContrast,
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
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    precision_recall_fscore_support,
)

from deck_data_pipeline import load_dataset



def binary_focal_loss(gamma=2.0, alpha=0.75):
    def loss_fn(y_true, y_pred):
        y_true = tf.cast(y_true, tf.float32)
        epsilon = tf.keras.backend.epsilon()
        y_pred = tf.clip_by_value(y_pred, epsilon, 1.0 - epsilon)

        p_t = tf.where(tf.equal(y_true, 1), y_pred, 1 - y_pred)
        alpha_t = tf.where(tf.equal(y_true, 1), alpha, 1 - alpha)

        loss = -alpha_t * tf.pow(1 - p_t, gamma) * tf.math.log(p_t)
        return tf.reduce_mean(loss)
    return loss_fn


def evaluate_classes(model, X, y, phase_name):
    """Print confusion matrix, per-class report, and threshold sweep."""
    y_pred_probs = model.predict(X, verbose=0)
    y_pred = (y_pred_probs > 0.5).astype(int).flatten()

    print(f"\n----- {phase_name}: Confusion Matrix -----")
    print("(rows = actual, cols = predicted)")
    print(confusion_matrix(y, y_pred))

    print(f"\n----- {phase_name}: Classification Report -----")
    print(classification_report(y, y_pred, target_names=["Uncracked", "Cracked"]))

    print(f"\n----- {phase_name}: Threshold Sensitivity (Cracked class) -----")
    print(f"{'Threshold':<12}{'Precision':<12}{'Recall':<12}{'F1':<12}")
    for threshold in [0.2, 0.3, 0.4, 0.5, 0.6, 0.7]:
        y_pred_t = (y_pred_probs > threshold).astype(int).flatten()
        precision, recall, f1, _ = precision_recall_fscore_support(
            y, y_pred_t, average=None, labels=[1], zero_division=0
        )
        print(f"{threshold:<12}{precision[0]:<12.4f}{recall[0]:<12.4f}{f1[0]:<12.4f}")


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
x = RandomRotation(0.05)(x)
x = RandomZoom(0.08)(x)
x = RandomContrast(0.05)(x)

x = Rescaling(scale=2.0, offset=-1)(x)
x = base_model(x, training=False)
x = GlobalAveragePooling2D()(x)

x = Dense(256, activation="relu", kernel_regularizer=l2(3e-4))(x)
x = Dropout(0.5)(x)

outputs = Dense(1, activation="sigmoid")(x)

model = Model(inputs, outputs)

# =====================================================
# Phase 1
# =====================================================

model.compile(
    optimizer=Adam(5e-4),
    loss=binary_focal_loss(gamma=2.0, alpha=0.75),
    metrics=["accuracy"]
)

checkpoint = ModelCheckpoint(
    "models/deck_best_model_focal.keras",
    monitor="val_loss",
    save_best_only=True,
    verbose=1
)

early_stop = EarlyStopping(
    monitor="val_loss",
    patience=6,
    restore_best_weights=True
)

reduce_lr = ReduceLROnPlateau(
    monitor="val_loss",
    factor=0.5,
    patience=3,
    min_lr=1e-7,
    verbose=1
)

print("\n========== Phase 1 (Focal Loss) ==========\n")

history1 = model.fit(
    X_train,
    y_train,
    validation_data=(X_test, y_test),
    epochs=15,
    batch_size=32,
    callbacks=[checkpoint, early_stop, reduce_lr],
    verbose=2
)

evaluate_classes(model, X_test, y_test, "Phase 1")

# =====================================================
# Phase 2 Fine Tuning
# =====================================================

print("\n========== Phase 2 (Focal Loss) ==========\n")

base_model.trainable = True

for layer in base_model.layers[:-15]:
    layer.trainable = False

for layer in base_model.layers:
    if isinstance(layer, tf.keras.layers.BatchNormalization):
        layer.trainable = False

model.compile(
    optimizer=Adam(1e-5),
    loss=binary_focal_loss(gamma=2.0, alpha=0.75),
    metrics=["accuracy"]
)

checkpoint2 = ModelCheckpoint(
    "models/deck_best_model_focal.keras",
    monitor="val_loss",
    save_best_only=True,
    verbose=1
)

early_stop2 = EarlyStopping(
    monitor="val_loss",
    patience=5,
    restore_best_weights=True
)

reduce_lr2 = ReduceLROnPlateau(
    monitor="val_loss",
    factor=0.5,
    patience=2,
    min_lr=1e-8,
    verbose=1
)

history2 = model.fit(
    X_train,
    y_train,
    validation_data=(X_test, y_test),
    epochs=15,
    batch_size=32,
    callbacks=[checkpoint2, early_stop2, reduce_lr2],
    verbose=2
)

evaluate_classes(model, X_test, y_test, "Phase 2")

# =====================================================
# Save Final Model
# =====================================================

model.save("models/deck_model_focal.keras")

loss, accuracy = model.evaluate(X_test, y_test, verbose=0)

print("\n===============================")
print(f"Final Test Accuracy : {accuracy*100:.2f}%")
print(f"Final Test Loss     : {loss:.4f}")
print("===============================")

evaluate_classes(model, X_test, y_test, "Final")