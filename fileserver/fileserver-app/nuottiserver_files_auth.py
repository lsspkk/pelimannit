import json
from datetime import datetime, timedelta

# Token cache
_token_cache = {}
_cache_last_updated = None
CACHE_TTL = 60  # Cache TTL in seconds


def check_password(environ, user, password):
    """Check if the provided token is valid"""
    global _token_cache, _cache_last_updated

    try:
        # Use the username as the token
        token = user

        # Check cache first
        current_time = datetime.now()
        if _cache_last_updated and (current_time - _cache_last_updated).total_seconds() < CACHE_TTL:
            for token_data in _token_cache.get('tokendata', []):
                if token_data['token'] == token:
                    token_date = datetime.strptime(
                        token_data['timestamp'].split()[0], '%Y-%m-%d')
                    if current_time.date() == token_date.date():
                        print(f"Token {token} found in cache and is valid")
                        return True
                    else:
                        print(f"Token {token} found in cache but expired")
                        return False

        # Cache miss or expired, load from file
        print(f"Loading tokens from file for token {token}")
        with open('/mnt/fileserver-app/saved.token.json', 'r') as f:
            tokens = json.load(f)

        # Update cache
        _token_cache = tokens
        _cache_last_updated = current_time

        # Check token
        for token_data in tokens.get('tokendata', []):
            if token_data['token'] == token:
                token_date = datetime.strptime(
                    token_data['timestamp'].split()[0], '%Y-%m-%d')
                if current_time.date() == token_date.date():
                    print(f"Token {token} is valid")
                    return True
                else:
                    print(f"Token {token} is expired")
                    return False

        print(f"Token {token} not found")
        return False

    except Exception as e:
        print(f"Error in check_password: {str(e)}")
        return False
