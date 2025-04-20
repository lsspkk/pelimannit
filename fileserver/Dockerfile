FROM python:3.10-slim

# Install Apache and required packages
RUN apt-get update && apt-get install -y \
    apache2 \
    apache2-dev \
    python3-dev \
    jq \
    libapache2-mod-wsgi-py3 \
    && rm -rf /var/lib/apt/lists/*

# Create necessary directories
RUN mkdir -p /mnt/fileserver-app/modules \
    /mnt/nuotti_files \
    /etc/apache2/sites-available \
    /etc/apache2/conf-available

# Copy the list_tokens.sh script
COPY list_tokens.sh /mnt/fileserver-app/

# Copy Apache configuration files
COPY fileserver-app/apache/nuottiserver_auth.conf /etc/apache2/sites-available/
COPY fileserver-app/apache/nuottiserver_files.conf /etc/apache2/conf-available/

# Set permissions
RUN chown -R www-data:www-data /mnt/fileserver-app /mnt/nuotti_files \
    && chmod 755 /mnt/fileserver-app /mnt/nuotti_files

# Copy the application files
COPY fileserver-app/ /mnt/fileserver-app/

# Create and set up virtual environment
RUN python3 -m venv /mnt/fileserver-app/venv \
    && . /mnt/fileserver-app/venv/bin/activate \
    && pip install -r /mnt/fileserver-app/requirements.txt \
    && chown -R www-data:www-data /mnt/fileserver-app/venv

# Set permissions for the token file and WSGI script
RUN chmod 644 /mnt/fileserver-app/saved.token.json \
    && chown www-data:www-data /mnt/fileserver-app/saved.token.json \
    && chmod 755 /mnt/fileserver-app/wsgi.py \
    && chown www-data:www-data /mnt/fileserver-app/wsgi.py

# Set working directory
WORKDIR /mnt/fileserver-app

# Enable required Apache modules and sites
RUN a2enmod wsgi headers rewrite proxy proxy_http authn_core auth_basic \
    && a2ensite nuottiserver_auth.conf \
    && a2enconf nuottiserver_files.conf \
    && a2dissite 000-default.conf

# Expose port 80
EXPOSE 80

# Start Apache in foreground
CMD ["apache2ctl", "-D", "FOREGROUND"] 