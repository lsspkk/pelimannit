# FileServer

Token management service with memory cache.
And example apache2 docker application,
that serves the token app, and offers few files in a directory
that requires a valid token in basic auth field.

## Endpoints

- `/nuotti_fileserver/` - Status check
- `/nuotti_fileserver/token/create` - Get today's token
- `/nuotti_fileserver/token/verify` - Verify token (POST with {"token": "value"})

## Test

```bash
docker-compose down && docker-compose up --build -d && sleep 2 && ./test_server.sh
```

## Test file transfer

```bash
./test_filetransfer.sh
```

The test script will:

1. Get a valid token
2. Test access to PDF and JPG files with the token
3. Test access with an invalid token
4. Test access without a token

## Memory Cache Implementation

The application uses a singleton pattern for token management:

- Tokens are loaded into memory on startup
- All operations use the in-memory cache
- Changes are persisted to disk when needed
- Only the last 7 tokens are kept in storage
- Token verification is done against the memory cache

## Setup

1. Install dependencies:

```bash
sudo apt-get update
sudo apt-get install -y apache2 libapache2-mod-wsgi-py3 python3-pip
sudo pip3 install flask
```

2. Configure Apache:

```bash
sudo a2enmod wsgi
sudo a2enmod rewrite
sudo a2enmod authnz_external
sudo systemctl restart apache2
```
