import os
import cv2
import kagglehub
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split

# ----------------------------
# Reproducibility
# ----------------------------
SEED = 42
np.random.seed(SEED)
tf.random.set_seed(SEED)

# ----------------------------
# Download Dataset
# ----------------------------
path = kagglehub.dataset_download(
    "harishmulchandani2/sdnet2018"
)

DATASET_PATH = os.path.join(path, "D")

cracked_path = os.path.join(DATASET_PATH, "CD")
uncracked_path = os.path.join(DATASET_PATH, "UD")

print("CD files :", len(os.listdir(cracked_path)))
print("UD files :", len(os.listdir(uncracked_path)))

IMG_SIZE = 224

images = []
labels = []

# ----------------------------
# Load Images
# ----------------------------
def load_images(folder_path, label, limit=None):

    files = os.listdir(folder_path)

    # Shuffle files
    np.random.shuffle(files)

    if limit is not None:
        files = files[:limit]

    for filename in files:

        img_path = os.path.join(folder_path, filename)

        image = cv2.imread(img_path)

        if image is None:
            continue

        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        image = cv2.resize(image, (IMG_SIZE, IMG_SIZE))

        image = image.astype(np.float32) / 255.0

        images.append(image)
        labels.append(label)


# ----------------------------
# Use ALL Available Data
# ----------------------------
# CHANGED: previously this undersampled the uncracked class down to
# crack_count, throwing away real training images to force balance.
# Now we keep everything and handle the resulting imbalance with
# class_weight in the training script instead.

load_images(cracked_path, 1)
load_images(uncracked_path, 0)

# ----------------------------
# Convert to NumPy
# ----------------------------
X = np.array(images, dtype=np.float32)
y = np.array(labels, dtype=np.int32)

# Shuffle entire dataset
indices = np.random.permutation(len(X))
X = X[indices]
y = y[indices]

print("Dataset Shape :", X.shape)
print("Labels :", np.bincount(y))

# ----------------------------
# Train Validation Split
# ----------------------------
X_train, X_val, y_train, y_val = train_test_split(
    X,
    y,
    test_size=0.3,
    random_state=SEED,
    stratify=y,
)

print("Training Images :", len(X_train))
print("Validation Images :", len(X_val))

# ----------------------------
# Loader Function
# ----------------------------
def load_dataset():
    return X_train, X_val, y_train, y_val