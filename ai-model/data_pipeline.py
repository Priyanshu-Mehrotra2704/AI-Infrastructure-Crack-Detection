import os
import cv2
import kagglehub
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split

# ====================================
# DOWNLOAD DATASET
# ====================================

path = kagglehub.dataset_download(
    "harishmulchandani2/sdnet2018"
)

print("Dataset Downloaded At:")
print(path)

# ====================================
# CHECK MAIN FOLDER
# ====================================

print("\nMain Folder Contents:")
print(os.listdir(path))

# ====================================
# DATASET PATH
# ====================================

DATASET_PATH = os.path.join(path, "D")

print("\nD Folder Contents:")
print(os.listdir(DATASET_PATH))

# ====================================
# IMAGE SETTINGS
# ====================================

IMG_SIZE = 224

# ====================================
# STORAGE
# ====================================

images = []
labels = []

# ====================================
# LOAD IMAGES FUNCTION
# ====================================

def load_images(folder_path, label, limit=2000):

    count = 0

    for filename in os.listdir(folder_path):

        if count >= limit:
            break

        img_path = os.path.join(folder_path, filename)

        # Read image
        image = cv2.imread(img_path)

        # Skip corrupted images
        if image is None:
            continue

        # Convert BGR -> RGB
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Resize image
        image = cv2.resize(image, (IMG_SIZE, IMG_SIZE))

        # Convert to float32 and normalize
        image = image.astype(np.float32) / 255.0

        images.append(image)
        labels.append(label)

        count += 1

# ====================================
# LOAD CRACKED IMAGES
# ====================================

cracked_path = os.path.join(DATASET_PATH, "CD")

print("\nLoading Cracked Images...")

load_images(cracked_path, 1)

# ====================================
# LOAD UNCRACKED IMAGES
# ====================================

uncracked_path = os.path.join(DATASET_PATH, "UD")

print("Loading Uncracked Images...")

load_images(uncracked_path, 0)

# ====================================
# CONVERT TO NUMPY ARRAYS
# ====================================

X = np.array(images)
y = np.array(labels)

# ====================================
# PRINT DATASET INFO
# ====================================

print("\nTotal Images:", len(X))
print("Labels Shape:", y.shape)

# ====================================
# TRAIN VALIDATION SPLIT
# ====================================

X_train, X_val, y_train, y_val = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

print("\nTraining Samples:", len(X_train))
print("Validation Samples:", len(X_val))

# ====================================
# DISPLAY SAMPLE IMAGES
# ====================================

plt.figure(figsize=(10, 10))

for i in range(9):

    plt.subplot(3, 3, i + 1)

    plt.imshow(X_train[i])

    plt.title(
        "Crack" if y_train[i] == 1 else "Non-Crack"
    )

    plt.axis("off")

plt.tight_layout()
plt.show()