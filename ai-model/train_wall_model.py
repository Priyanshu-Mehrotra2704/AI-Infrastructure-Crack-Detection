import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D
from tensorflow.keras.layers import Flatten, Dense
from tensorflow.keras.layers import RandomFlip, RandomRotation, RandomZoom
from wall_data_pipeline import load_dataset
from tensorflow.keras.layers import BatchNormalization, Dropout
from tensorflow.keras.optimizers import Adam

model = Sequential([
    # Data augmentation — chhote dataset ko "effectively" bada dikhata hai,
    # sirf training ke time active rehta hai, inference pe skip ho jaata hai
    RandomFlip("horizontal", input_shape=(224, 224, 3)),
    RandomRotation(0.1),
    RandomZoom(0.1),

    Conv2D(32, (3,3), activation="relu", name="conv1"),
    BatchNormalization(momentum=0.9),
    MaxPooling2D(),

    Conv2D(64, (3,3), activation="relu", name="conv2"),
    BatchNormalization(momentum=0.9),
    MaxPooling2D(),

    Conv2D(128, (3,3), activation="relu", name ="conv3"),
    BatchNormalization(momentum=0.9),
    MaxPooling2D(),

    Conv2D(256, (3,3), activation="relu", name = "last_conv_layer"),
    BatchNormalization(momentum=0.9),
    MaxPooling2D(),

    Flatten(),

    Dense(128, activation="relu"),
    Dropout(0.5),
    Dense(1, activation="sigmoid")
])

model.compile(
    optimizer=Adam(learning_rate=0.0001),
    loss="binary_crossentropy",
    metrics=["accuracy"]
)
X_train, X_test, y_train, y_test = load_dataset()

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

model.fit(
    X_train, y_train,
    epochs=30,
    batch_size=32,
    validation_data=(X_test, y_test),
    verbose=2,
    callbacks=[checkpoint, early_stop]
)

model.save("models/wall_model.keras")