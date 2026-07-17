---
title: Home Assistant Reverse Proxy + Access Whitelist
author: Lee
---

## Installation

Refer to the official documentation: <https://www.home-assistant.io/installation>

I installed using Docker Compose and recommend this method.[Official documentation](https://www.home-assistant.io/installation/linux#docker-compose)

## Reverse Proxy

Home Assistant's security policy disables reverse proxy by default. Modify `configuration.yaml`.

```yaml
# configuration.yaml
http:
  # It is recommended to configure SSL only in nginx; there is no need for two layers of SSL for internal reverse proxies
  #ssl_certificate: [.crt file]
  #ssl_key: [.key file]
  use_x_forwarded_for: true
  trusted_proxies: #Reverse proxy whitelist. If not this IP, change it accordingly.
    - 127.0.0.1
    - ::1
  server_host: 127.0.0.1 #Listen only to access from this IP, optional: restrict access to only via reverse proxy
```

## nginx Configuration

Installation: See [Beginner's Guide to nginx Reverse Proxy](https://leetfs.com/tips/nginx)

Get certificate: [Certbot Automated SSL Certificates](https://leetfs.com/tips/certbot)

### WebSocket

WebSocket must be enabled or access will not work properly

```
    # Reverse proxy configuration
    location / {
        # Required WebSocket headers
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Read and write timeout settings
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;

        # Prevent Nginx from caching WebSocket data
        proxy_buffering off;
```

### Example

```
server {
    listen 443 ssl; # SSL listen
    listen [::]:443 ssl;

    server_name your_domain;

    # SSL certificate path
    ssl_certificate /etc/letsencrypt/live/;
    ssl_certificate_key /etc/letsencrypt/live/;

    # Security optimization
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305';
    ssl_session_cache shared:SSL:10m;

    # HSTS (optional, enforces HTTPS)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Limit file upload size
    client_max_body_size 20G;

    # Reverse proxy configuration
    location / {
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host $server_name;

        proxy_pass http://127.0.0.1:8123; # Backend service address

        # Enhance proxy security
        proxy_set_header X-Frame-Options SAMEORIGIN;
        proxy_set_header X-XSS-Protection "1; mode=block";
        proxy_set_header X-Content-Type-Options nosniff;

        # Required WebSocket headers
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Read and write timeout settings
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;

        # Prevent Nginx from caching WebSocket data
        proxy_buffering off;

        # Restrict access, only allow access from LAN
        # allow ip_here;  # hk
        # allow ip_here_as_well;    #jp
        # deny all;              # deny all other requests
    }
}
server {
    listen 80;
    listen [::]:80;

    server_name your_domain;

    return 301 https://$host$request_uri; # Permanently redirect to HTTPS
}
```
