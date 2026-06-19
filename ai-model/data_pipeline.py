import os
import cv2
import kagglehub
import numpy as np
from sklearn.model_selection import train_test_split

# Download dataset
path = kagglehub.dataset_download(
    "harishmulchandani2/sdnet2018"
)

DATASET_PATH = os.path.join(path, "P")

cracked_path = os.path.join(DATASET_PATH, "CP")
uncracked_path = os.path.join(DATASET_PATH, "UP")

print("CP files:", len(os.listdir(cracked_path)))
print("UP files:", len(os.listdir(uncracked_path)))

IMG_SIZE = 224

images = []
labels = []

def load_images(folder_path, label, limit=800):

    count = 0

    for filename in os.listdir(folder_path):

        if count >= limit:
            break

        img_path = os.path.join(folder_path, filename)

        image = cv2.imread(img_path)

        if image is None:
            continue

        image = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2RGB
        )

        image = cv2.resize(
            image,
            (IMG_SIZE, IMG_SIZE)
        )

        image = image.astype(np.float32) / 255.0

        images.append(image)
        labels.append(label)

        count += 1

load_images(cracked_path, 1)
load_images(uncracked_path, 0)

X = np.array(images, dtype=np.float32)
y = np.array(labels, dtype=np.int32)

print("Dataset Shape:", X.shape)
print("Labels:", np.bincount(y))

X_train, X_val, y_train, y_val = train_test_split(
    X,
    y,
    test_size=0.1,
    random_state=42,
    stratify=y
)

def load_dataset():
    return X_train, X_val, y_train, y_val

