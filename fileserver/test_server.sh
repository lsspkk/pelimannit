#!/bin/bash

set -e

server=${1:-http://localhost}

if [ "$1" == "-h" ] || [ "$1" == "--help" ]; then
    echo "Usage: $0 [server_url]"
    echo "  server_url: The full URL of the server (default: http://localhost)"
    exit 0
fi

echo -e "\nTesting FileServer on $server...\n"

echo "GET /"
curl -s -L $server/nuotti_fileserver/

echo -e "\nGET /token/create"
token_response=$(curl -s $server/nuotti_fileserver/token/create)
echo "$token_response"

if ! echo "$token_response" | grep -q "token"; then
    echo "FAILED: Failed to get token"
    exit 1
fi

token=$(echo "$token_response" | jq -r '.token')

echo -e "\nGET /token/verify/$token"
curl -s $server/nuotti_fileserver/token/verify/$token

if [ "$server" == "http://localhost" ]; then
    echo -e "\nListing all tokens from container..."
    docker exec fileserver_web_1 /bin/bash -c "cd /mnt/fileserver-app && ./list_tokens.sh"
fi 