#!/bin/bash

set -e

server=${1:-http://localhost}

if [ "$1" == "-h" ] || [ "$1" == "--help" ]; then
    echo "Usage: $0 [server_url]"
    echo "  server_url: The full URL of the server (default: http://localhost)"
    exit 0
fi

echo -e "\nTesting file transfer with $server...\n"

# If using localhost, copy test files to Docker container
if [ "$server" == "http://localhost" ]; then
    echo "Copying test files to Docker container..."
    docker exec fileserver_web_1 mkdir -p /mnt/nuotti_files
    docker cp test_files/foo.pdf fileserver_web_1:/mnt/nuotti_files/
    docker cp test_files/bar.jpg fileserver_web_1:/mnt/nuotti_files/
    docker exec fileserver_web_1 chown -R www-data:www-data /mnt/nuotti_files
fi

# Function to encode token for basic auth
encode_token() {
    echo -n "$1" | base64
}

# Function to test file access
test_file_access() {
    local url=$1
    local token=$2
    local expected_status=$3
    local description=$4
    
    # Encode token for basic auth
    local auth_header="Basic $(encode_token "$token")"
    
    echo "GET $url"
    status_code=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: $auth_header" \
        "$url")
    
    echo "HTTP Status: $status_code"
    if [ "$status_code" = "$expected_status" ]; then
        echo "✓ Success: $description"
    else
        echo "✗ Failed: Expected $expected_status, got $status_code"
    fi
    echo
}

# 1. Get a valid token
echo "1. Getting a valid token..."
response=$(curl -s "$server/nuotti_fileserver/token/create")
if [ $? -ne 0 ]; then
    echo "Error: Could not connect to server"
    exit 1
fi

token=$(echo "$response" | jq -r .token 2>/dev/null)
if [ $? -ne 0 ] || [ -z "$token" ]; then
    echo "Error: Invalid response from server"
    echo "Response: $response"
    exit 1
fi
echo "Got token: $token"
echo

# 2. Test with valid token (PDF)
echo "2. Testing with valid token (PDF)..."
test_file_access "$server/nuotti_files/foo.pdf" "$token" "200" "File accessed with valid token"

# 3. Test with valid token (JPG)
echo "3. Testing with valid token (JPG)..."
test_file_access "$server/nuotti_files/bar.jpg" "$token" "200" "File accessed with valid token"

# 4. Test with invalid token
echo "4. Testing with invalid token..."
test_file_access "$server/nuotti_files/foo.pdf" "invalid-token" "401" "Access denied with invalid token"

# 5. Test without token
echo "5. Testing without token..."
test_file_access "$server/nuotti_files/foo.pdf" "" "401" "Access denied without token" 