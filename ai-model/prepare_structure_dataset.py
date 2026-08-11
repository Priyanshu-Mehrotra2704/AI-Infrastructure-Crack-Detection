import os
import shutil
import random
from pathlib import Path

import kagglehub


# ============================================================
# CONFIGURATION
# ============================================================

# Kaggle dataset
KAGGLE_DATASET = "harishmulchandani2/sdnet2018"

# Where the organized dataset will be created
OUTPUT_DIR = Path("structure_dataset")

# Maximum number of images to copy from each class.
# Set to None if you want to use ALL images.
MAX_IMAGES_PER_CLASS = 3000

# Reproducible random selection
RANDOM_SEED = 42


# ============================================================
# CLASS MAPPING
# ============================================================

# SDNET2018:
#
# D = Concrete Deck
# P = Concrete Pavement
# W = Concrete Wall
#
# We rename them to names used by our application.

CLASS_MAPPING = {
    "D": "bridge_deck",
    "P": "pavement",
    "W": "wall",
}


# ============================================================
# SUPPORTED IMAGE EXTENSIONS
# ============================================================

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".webp",
}


# ============================================================
# DOWNLOAD DATASET
# ============================================================

def download_dataset():

    print("=" * 60)
    print("DOWNLOADING SDNET2018")
    print("=" * 60)

    dataset_path = kagglehub.dataset_download(
        KAGGLE_DATASET
    )

    print()
    print("Dataset downloaded successfully.")
    print("Dataset location:")
    print(dataset_path)
    print()

    return Path(dataset_path)


# ============================================================
# FIND CLASS DIRECTORIES
# ============================================================

def find_class_directory(dataset_path, class_name):

    # First try the expected location
    expected_path = dataset_path / class_name

    if expected_path.exists() and expected_path.is_dir():
        return expected_path

    # If not found, search recursively
    for path in dataset_path.rglob("*"):

        if path.is_dir() and path.name.lower() == class_name.lower():
            return path

    return None


# ============================================================
# GET IMAGES
# ============================================================

def get_images(directory):

    images = []

    for path in directory.rglob("*"):

        if path.is_file():

            if path.suffix.lower() in IMAGE_EXTENSIONS:
                images.append(path)

    return images


# ============================================================
# CREATE OUTPUT DIRECTORIES
# ============================================================

def create_output_directories():

    print("=" * 60)
    print("CREATING OUTPUT DIRECTORIES")
    print("=" * 60)

    for output_class in CLASS_MAPPING.values():

        output_path = OUTPUT_DIR / output_class

        output_path.mkdir(
            parents=True,
            exist_ok=True
        )

        print(f"Created: {output_path}")

    print()


# ============================================================
# COPY IMAGES
# ============================================================

def copy_images(
    source_directory,
    destination_directory,
    max_images=None
):

    images = get_images(source_directory)

    print(
        f"Found {len(images)} images in "
        f"{source_directory}"
    )

    # Shuffle so that if we limit the number of images,
    # we don't always take the same files.
    random.shuffle(images)

    if max_images is not None:

        images = images[:max_images]

    copied = 0

    for index, source_image in enumerate(images):

        # Create a unique filename.
        #
        # Example:
        # pavement_000001.jpg
        #
        extension = source_image.suffix.lower()

        destination_name = (
            f"{destination_directory.name}_"
            f"{index:06d}"
            f"{extension}"
        )

        destination_path = (
            destination_directory /
            destination_name
        )

        try:

            shutil.copy2(
                source_image,
                destination_path
            )

            copied += 1

        except Exception as error:

            print(
                f"Could not copy {source_image}: "
                f"{error}"
            )

    return copied


# ============================================================
# MAIN
# ============================================================

def main():

    random.seed(RANDOM_SEED)

    print()
    print("=" * 60)
    print("SDNET2018 STRUCTURE DATASET PREPARATION")
    print("=" * 60)
    print()

    # --------------------------------------------------------
    # 1. Download dataset
    # --------------------------------------------------------

    dataset_path = download_dataset()

    # --------------------------------------------------------
    # 2. Create output folders
    # --------------------------------------------------------

    create_output_directories()

    # --------------------------------------------------------
    # 3. Process each class
    # --------------------------------------------------------

    total_copied = 0

    print("=" * 60)
    print("PROCESSING CLASSES")
    print("=" * 60)
    print()

    for source_class, output_class in CLASS_MAPPING.items():

        print("-" * 60)
        print(
            f"Processing: {source_class} "
            f"→ {output_class}"
        )
        print("-" * 60)

        # Find source directory
        source_directory = find_class_directory(
            dataset_path,
            source_class
        )

        if source_directory is None:

            print(
                f"ERROR: Could not find "
                f"directory '{source_class}'"
            )

            continue

        print(
            f"Source directory: "
            f"{source_directory}"
        )

        # Destination
        destination_directory = (
            OUTPUT_DIR / output_class
        )

        # Copy images
        copied = copy_images(
            source_directory,
            destination_directory,
            MAX_IMAGES_PER_CLASS
        )

        print(
            f"Copied {copied} images "
            f"to {destination_directory}"
        )

        print()

        total_copied += copied

    # --------------------------------------------------------
    # 4. Print final summary
    # --------------------------------------------------------

    print("=" * 60)
    print("DATASET PREPARATION COMPLETE")
    print("=" * 60)
    print()

    for output_class in CLASS_MAPPING.values():

        directory = OUTPUT_DIR / output_class

        count = sum(
            1
            for file in directory.iterdir()
            if file.is_file()
            and file.suffix.lower() in IMAGE_EXTENSIONS
        )

        print(
            f"{output_class:15} : {count} images"
        )

    print()
    print(f"Total images: {total_copied}")
    print()

    print("Dataset location:")
    print(OUTPUT_DIR.resolve())

    print()
    print("Final structure:")
    print()
    print("structure_dataset/")
    print("├── pavement/")
    print("├── wall/")
    print("└── bridge_deck/")
    print()

    print("=" * 60)


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    main()