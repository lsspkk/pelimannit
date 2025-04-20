import json
import uuid
import os
from datetime import datetime

# Get token file location from environment variable, default to saved.token.json
TOKEN_FILE = os.getenv('TOKEN_FILE', 'saved.token.json')


class TokenManager:
    def __init__(self):
        self.token_cache = None
        self.load_tokens()

    def load_tokens(self):
        try:
            with open(TOKEN_FILE, 'r') as f:
                self.token_cache = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            self.token_cache = {"tokendata": []}

    def save_tokens(self):
        # Keep only the last 7 tokens
        self.token_cache['tokendata'] = self.token_cache['tokendata'][-7:]
        with open(TOKEN_FILE, 'w') as f:
            json.dump(self.token_cache, f, indent=2)

    def get_or_create_token(self):
        today = datetime.now().strftime('%Y-%m-%d')

        # Check if we already have a token for today
        for token_data in self.token_cache.get('tokendata', []):
            if token_data['timestamp'].startswith(today):
                return token_data['token']

        # Generate new token if none exists for today
        new_token = str(uuid.uuid4())
        self.token_cache['tokendata'].append({
            "token": new_token,
            "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
        self.save_tokens()

        return new_token

    def verify_token(self, token):
        today = datetime.now().strftime('%Y-%m-%d')

        # Check if the token exists and is from today
        for token_data in self.token_cache.get('tokendata', []):
            if token_data['timestamp'].startswith(today) and token_data['token'] == token:
                return True

        return False


# Create a singleton instance
token_manager = TokenManager()

# Public functions that use the singleton


def load_tokens():
    return token_manager.token_cache


def save_tokens(tokens):
    token_manager.token_cache = tokens
    token_manager.save_tokens()


def generate_token():
    return str(uuid.uuid4())
