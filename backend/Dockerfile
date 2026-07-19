FROM python:3.11-slim

WORKDIR /app

# opencv-python (non-headless) needs these system libs inside a slim container
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/
COPY ai-model/ ./ai-model/

WORKDIR /app/backend

RUN mkdir -p uploaded_images generated_reports gradcam/generated_heatmaps

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]