FROM python:3.11-slim

# Install system dependencies: FFmpeg is required for CV video trimming and audio mixing
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application source code
COPY . .

# Ensure data storage directories exist
RUN mkdir -p /app/data/uploads /app/data/highlights /app/data/music /app/data/logs

# Support dynamic host PORT (Render, Railway, Heroku, Cloud Run)
ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
