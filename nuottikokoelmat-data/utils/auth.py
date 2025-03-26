import os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
TOKEN_FILE = 'env/token.json'


def get_service():
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
        return build('drive', 'v3', credentials=creds)
    else:
        raise FileNotFoundError(f"Token file not found at {TOKEN_FILE}")
