import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D
from tensorflow.keras.layers import Flatten, Dense
from wall_data_pipeline import load_dataset
from tensorflow.keras.layers import BatchNormalization,Dropout

model = Sequential([
    Conv2D(32, (3,3), activation="relu", input_shape=(224,224,3), name="conv1"),
    MaxPooling2D(),

    Conv2D(64, (3,3), activation="relu", name="conv2"),
    MaxPooling2D(),
    Conv2D(128, (3,3), activation="relu", name ="conv3"),
    MaxPooling2D(),
    Conv2D(256, (3,3), activation="relu", name = "last_conv_layer"),
    MaxPooling2D(),

    Flatten(),

    Dense(128, activation="relu"),
    Dense(1, activation="sigmoid")
])

model.compile(
    optimizer="adam",
    loss="binary_crossentropy",
    metrics=["accuracy"]
)
X_train, X_test, y_train, y_test = load_dataset()
checkpoint = tf.keras.callbacks.ModelCheckpoint(
    "models/wall_best_model.keras",
    monitor="val_accuracy",
    save_best_only=True
)

model.fit(
    X_train, y_train,
    epochs=20,
    batch_size=16,
    validation_data=(X_test, y_test),
    verbose=2,
    callbacks=[checkpoint]
    
)

model.save("models/wall_model.keras")