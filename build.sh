#!/usr/bin/env bash
set -e

echo "==> [1/3] Installing Python dependencies..."
pip install -r requirements.txt
pip install -e . || true
python -m spacy download en_core_web_sm || true

echo "==> [2/3] Building frontend application..."
if [ -d "frontend" ]; then
  cd frontend
  npm install
  npm run build
  cd ..
else
  npm install
  npm run build
fi

echo "==> [3/3] Syncing output directories..."
mkdir -p "Resume Augmentation" dist
cp -r frontend/dist/* "Resume Augmentation/" 2>/dev/null || true
cp -r frontend/dist/* dist/ 2>/dev/null || true

echo "==> Build finished successfully!"
