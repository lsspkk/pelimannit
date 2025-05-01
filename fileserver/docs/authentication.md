# Token Authentication in Apache2 with Python

This document outlines different approaches to implement token-based authentication in Apache2 using Python.

## 1. mod_wsgi with Custom Authentication Handler

The most flexible approach is to use mod_wsgi with a custom Python authentication handler:

```python
def check_password(environ, user, password):
    # Check token in Authorization header
    auth = environ.get('HTTP_AUTHORIZATION', '')
    if not auth.startswith('Bearer '):
        return False
    token = auth[7:]
    # Verify token with your Python code
    return verify_token(token)
```

Configure Apache:

```apache
<Directory /path/to/files>
    AuthType Basic
    AuthName "Token Required"
    AuthBasicProvider wsgi
    WSGIAuthUserScript /path/to/auth_handler.py
    Require valid-user
</Directory>
```

Pros:

- Full Python control over token verification
- Can use any Python libraries
- Can implement complex token validation logic

Cons:

- Requires mod_wsgi configuration
- Slightly more complex setup

## 2. mod_rewrite with External Script

Use mod_rewrite to call an external Python script:

```apache
<Directory /path/to/files>
    RewriteEngine On
    RewriteCond %{HTTP:Authorization} ^Bearer\s+(.*)$
    RewriteRule .* - [E=TOKEN:%1]
    RewriteCond %{ENV:TOKEN} .+
    RewriteRule .* /path/to/verify.py [P,L]
</Directory>
```

Pros:

- Simple to implement
- Can use any Python script
- Good for basic token validation

Cons:

- Less efficient (spawns new process)
- Limited to simple pass/fail responses

## 3. mod_authnz_external with Python Script

Use mod_authnz_external to call a Python script:

```apache
<Directory /path/to/files>
    AuthType Basic
    AuthName "Token Required"
    AuthBasicProvider external
    AuthExternal token_verify
    Require valid-user
</Directory>

<IfModule mod_authnz_external.c>
    DefineExternalAuth token_verify pipe /path/to/verify.py
</IfModule>
```

Pros:

- Standard Apache authentication module
- Clean integration with Apache auth system
- Good for simple token checks

Cons:

- Requires additional module
- Limited to basic authentication flow

## 4. mod_proxy with Flask App

Proxy requests to a Flask app for token verification:

```apache
<Directory /path/to/files>
    RewriteEngine On
    RewriteCond %{HTTP:Authorization} ^Bearer\s+(.*)$
    RewriteRule .* http://localhost:5000/verify [P,L]
</Directory>
```

Pros:

- Can use full Flask application
- Most flexible approach
- Can implement complex business logic

Cons:

- Requires running separate Flask app
- More complex setup
- Additional network overhead

## Current Implementation

The current implementation uses a simple mod_rewrite approach that:

1. Checks for presence of a Bearer token
2. Denies access if no token is present
3. Allows access to specific file types with any valid Bearer token

This approach was chosen for its simplicity and reliability, while still providing basic token-based access control.
