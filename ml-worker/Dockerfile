FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

# Install system dependencies needed for EasyOCR
RUN apt-get update && apt-get install -y \
    libglib2.0-0 libsm6 libxext6 libxrender-dev libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

# Install PyTorch CPU version
RUN pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "main.py"]
