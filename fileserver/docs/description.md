# File Server System Documentation

## System Overview

The file server system consists of two main components:

1. A Flask application for token management
2. An Apache server with Basic Authentication for file serving

## Component Details

### 1. Flask Token Server

The Flask application (`fileserver-app/wsgi.py`) handles token generation and verification:

- Runs as a WSGI application under Apache
- Provides endpoints for token creation and verification
- Stores tokens in a JSON file with timestamps
- Implements token expiration and cleanup

### 2. Apache File Server

The Apache server handles file serving with Basic Authentication:

- Uses mod_wsgi to run the Flask application
- Implements Basic Authentication for file access using `mod_auth_basic`
- Uses a custom authentication provider script (`nuottiserver_files_auth.py`) to verify tokens
- Implements token caching with 60-second TTL
- Serves files from `/mnt/nuotti_files/`
- Uses custom Apache configurations for authentication

## System Structure

```
/
├── mnt/
│   ├── fileserver-app/          # Flask application
│   │   ├── modules/             # Python modules
│   │   ├── venv/                # Python virtual environment
│   │   ├── wsgi.py             # WSGI application entry point
│   │   ├── nuottiserver_files_auth.py # Custom authentication provider
│   │   └── saved.token.json    # Token storage
│   └── nuotti_files/           # File storage directory
└── etc/
    └── apache2/
        ├── sites-available/
        │   └── nuottiserver_auth.conf  # Apache site config
        └── conf-available/
            └── nuottiserver_files.conf # Apache file serving config
```

## Apache Configuration

### nuottiserver_auth.conf

- Defines the WSGI application
- Sets up the Python virtual environment
- Configures the Flask application path
- Handles token-related endpoints

### nuottiserver_files.conf

- Configures file serving
- Implements Basic Authentication using `mod_auth_basic`
- Uses the custom authentication provider script
- Sets up file access permissions
- Defines authentication provider

## Authentication Flow

1. Token Creation (Flask):

   - Client requests a new token from `/nuotti_fileserver/token/create`
   - Flask generates and stores a UUID token
   - Token is returned to the client

2. File Access (Apache):
   - Client includes token in Basic Auth header
   - Apache's `mod_auth_basic` extracts credentials
   - Custom `nuottiserver_files_auth.py` script:
     - Checks token cache first (60-second TTL)
     - If cache miss, loads tokens from file
     - Verifies token existence and validity
     - Checks token expiration (daily expiration)
     - Returns success/failure to Apache
   - Apache grants or denies access based on provider response

## Python Environment

- Uses Python 3.10
- Virtual environment in `/mnt/fileserver-app/venv`
- Required packages:
  - Flask
  - Werkzeug
  - Other dependencies in requirements.txt

## Security Features

### Implemented Security Measures

1. Token-based authentication

   - Tokens are UUID-based
   - Tokens are stored with timestamps
   - Token expiration mechanism (daily expiration)
   - Token verification before file access
   - Token caching for performance (60-second TTL)

2. Basic Authentication

   - Apache's `mod_auth_basic` handles credential extraction
   - Custom authentication provider for token verification
   - Apache-level access control
   - Secure transmission (should be used with HTTPS)

3. File System Security

   - Proper file permissions
   - www-data user isolation
   - Separate directories for application and files

4. Container Security
   - Minimal base image
   - Limited package installation
   - Proper user permissions
   - Isolated file system

### Potential Weak Points

1. Token Storage

   - Tokens stored in plain JSON file
   - No encryption of stored tokens
   - File-based storage might have performance issues at scale
   - Cache TTL might be too short for high-traffic scenarios

2. Authentication

   - Basic Authentication transmits credentials in base64
   - Should be used with HTTPS in production
   - No rate limiting on token creation
   - Authentication provider script runs for each request
   - Daily token expiration might be too long for some use cases

3. File Access

   - No file type validation
   - No size limits on files
   - No virus scanning

4. General Security
   - No logging of file access attempts
   - No IP-based access control
   - No session management
   - No brute force protection

## Version Information

- Python: 3.10
- Apache: 2.4
- Flask: (version from requirements.txt)
- mod_wsgi: (version from package manager)
- mod_auth_basic: (version from package manager)
- Docker: (host version)

## Recommendations for Production

1. Add HTTPS support
2. Implement rate limiting
3. Add file access logging
4. Implement file type validation
5. Add virus scanning
6. Consider using a database for token storage
7. Add IP-based access control
8. Implement session management
9. Add brute force protection
10. Adjust cache TTL based on traffic patterns
11. Consider shorter token expiration periods
