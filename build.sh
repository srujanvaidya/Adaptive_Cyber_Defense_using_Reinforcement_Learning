#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

# Move into Django project directory
cd RL

# Install dependencies
pip install -r requirements.txt

# Collect static files for WhiteNoise
python manage.py collectstatic --noinput

# Apply database migrations
python manage.py migrate
