#!/bin/bash

set -e

server=${1:-http://localhost}

if [ "$1" == "-h" ] || [ "$1" == "--help" ]; then
    echo "Usage: $0 [server_url]"
    echo "  server_url: The full URL of the server (default: http://localhost)"
    exit 0
fi

echo -e "\nChecking Apache logs for $server...\n"

if [ "$server" == "http://localhost" ]; then
    echo "GET /var/log/apache2/access.log"
    docker exec fileserver_web_1 tail -n 20 /var/log/apache2/access.log

    echo -e "\nGET /var/log/apache2/error.log"
    docker exec fileserver_web_1 tail -n 20 /var/log/apache2/error.log
else
    # Extract hostname from URL
    host=$(echo "$server" | sed -E 's|^https?://([^/]+).*|\1|')
    
    echo "GET /var/log/apache2/access.log"
    ssh "$host" "tail -n 20 /var/log/apache2/access.log"

    echo -e "\nGET /var/log/apache2/error.log"
    ssh "$host" "tail -n 20 /var/log/apache2/error.log"
fi 