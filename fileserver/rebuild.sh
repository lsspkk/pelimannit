#!/bin/bash
set -e

echo "Stopping and removing containers..."
docker-compose down --remove-orphans --volumes || true

echo "Building new image..."
docker-compose build

echo "Starting containers..."
docker-compose up -d

echo "Waiting for Apache to start..."
sleep 2

# Check if Apache is running
if ! docker-compose ps | grep -q "Up"; then
    echo "Error: Container failed to start"
    docker-compose logs
    exit 1
fi

# Run tests if requested
if [ "$1" == "--test" ]; then
    echo "Running tests..."
    ./test_filetransfer.sh
fi

echo "Done!" 