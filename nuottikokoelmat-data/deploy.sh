#!/bin/bash

# === CONFIG ===
HOST="xn--hyty-6qa.net"
FOLDER="/mnt/nuottikokoelmat-data"
ARCHIVE_NAME="nuottikokoelmat_data_deploy.zip"
LOCAL_DIR="."  # Adjust to project subfolder if needed

# === PACKAGE ===
echo "📦 Zipping project (excluding git, venv, pycache)..."
zip -r $ARCHIVE_NAME $LOCAL_DIR \
  -x "*.git*" "venv/*" "__pycache__/*" "*.pyc" > /dev/null

# === DEPLOY ===
echo "🚀 Deploying to $HOST:$FOLDER"
ssh "$HOST" "mkdir -p $FOLDER"

# Copy zip file
scp $ARCHIVE_NAME "$HOST:$FOLDER/"

# Unzip and clean up
ssh "$HOST" "cd $FOLDER && unzip -o $ARCHIVE_NAME && rm $ARCHIVE_NAME"

# Clean up local zip
rm $ARCHIVE_NAME

echo "✅ Deployment complete."
