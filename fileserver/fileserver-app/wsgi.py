#!/usr/bin/python3
from app import app as application
import sys
import os
import logging

# Add application directory to Python path
sys.path.insert(0, '/mnt/fileserver-app')

# Set up paths before importing the app
logging.basicConfig(stream=sys.stderr)

# Import the Flask application

if __name__ == "__main__":
    application.run()
