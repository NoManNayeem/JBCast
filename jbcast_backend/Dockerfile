# Use a minimal Python base image
FROM python:3.11-slim

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y build-essential libpq-dev && apt-get clean

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy entire backend project
COPY . .

# Collect static files (do this here for prod builds)
RUN python manage.py collectstatic --noinput

# Entrypoint is set via docker-compose command per service (e.g. gunicorn or celery)
