---
title: nginx Reverse Proxy Introduction
author: Lee
---

## Overview

This tutorial is based on Debian, using nginx as a reverse proxy example for Docker containers already running.

### Why use a reverse proxy?

The following is information found online:

A reverse proxy is a type of server that receives client requests, forwards them to web servers, and then returns the results to the client, as if the proxy server had directly handled the request itself.

A reverse proxy proxies for servers, standing on the same side as the web servers.The real servers are invisible to clients.That is why it is called "reverse".

Reverse proxy can be used for:

Protecting servers by hiding their real IP addresses.
Load balancing: distributing requests among different servers according to traffic and server load.
Caching static content and handling large volumes of short-lived dynamic requests.
Serving as an application layer firewall for protection.
Encrypting/decrypting SSL communication.

### For example

For example, if we need to run three websites (a, b, c) on a server, all needing port 443, but the server has only one IP and can’t allocate three 443 ports.

At this point, reverse proxy appears: nginx takes over port 443, and routes users accessing a.leetfs.com to site a, users accessing b.leetfs.com to site b, and similarly for c.

## Installation

1. Update the system index: `sudo apt update`
2. Install nginx: `sudo apt install nginx`

After installation is complete, Nginx will automatically start and be set to launch on boot. You can check Nginx’s status with `sudo systemctl status nginx`.

## Configure nginx

- Default configuration file: `/etc/nginx/nginx.conf`
- Website configuration directory: `/etc/nginx/sites-available/`
- Directory storing enabled configuration files: `/etc/nginx/sites-enabled/`

Next, we will configure nginx by modifying files in the `/etc/nginx/sites-available/` directory.

## Reverse proxy to docker

Our host runs the Weblate service via Docker. It would not be ideal for the container to directly take over the server's port 443, as this would restrict the port to only one service on the server.

> You need to have some understanding of docker to read this section.

### Configure the dockerfile

Let's look at the container's dockerfile. `- 443:4443` under ports means the container listens on the server's port 443 and forwards received requests to port 4443 used by the docker container.

```yaml
services:
  weblate:
    ports:
      - 443:4443
    environment:
# ...more below
```

First, we change port 443, the standard https port, to another unused port on the server, e.g. `- 4443:4443`. After modifying, reload the container to apply the changes.

## Modify nginx configuration file

Switch to the website configuration directory: `/etc/nginx/sites-available/`. Create a new configuration file, named `weblate` in this example.

Refer to the following code for the configuration file content:

```nginx
server {
    listen 443 ssl; # ssl means ssl encryption is used
    listen [::]:443 ssl;

    server_name leetfs.com; # the domain to be reverse proxied

    ssl_certificate /var/lib/docker/volumes/weblate-docker_weblate-data/_data/ssl/fullchain.pem; # ssl certificate
    ssl_certificate_key /var/lib/docker/volumes/weblate-docker_weblate-data/_data/ssl/privkey.pem; # ssl private key

    ssl_protocols TLSv1.2 TLSv1.3;  # Enable TLSv1.2 and TLSv1.3, disable SSLv3 and outdated protocols
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';  # Recommended cipher suites
    ssl_prefer_server_ciphers on;  # Prefer server cipher suites

    location / {
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host $server_name;

        proxy_pass https://127.0.0.1:4443; # The reverse proxy destination, set to 4443 because we set the docker port above. 127.0.0.1 means the server itself.

        # Enhance proxy security
        proxy_set_header X-Frame-Options SAMEORIGIN;
        proxy_set_header X-XSS-Protection "1; mode=block";
        proxy_set_header X-Content-Type-Options nosniff;
    }
}

```

After modifying the configuration file, create a symbolic link to enable it (remember to change 'weblate' to your own file name).

```bash
sudo ln -s /etc/nginx/sites-available/weblate /etc/nginx/sites-enabled/
```

- Test if the configuration file is correct: `sudo nginx -t`
- Reload Nginx configuration: `sudo systemctl reload nginx`

### Obtain the certificate

For the `ssl_certificate` and `ssl_certificate_key` above, you need to fill in the certificate and private key paths. Refer to [Certbot: Automatically Obtain SSL Certificates](https://leetfs.com/tips/certbot).

## Disable site configuration

If you want to disable a site's configuration, you only need to delete the symbolic link, without deleting the actual file. This makes it easy to reuse later.

```bash
sudo rm /etc/nginx/sites-enabled/filename
```

After finishing, remember to reload the Nginx configuration: `sudo systemctl reload nginx`

## Add concurrent connection/request rate limit

Place under the http block.

```bash
# etc/nginx/nginx.conf

# Concurrent connection limit (no more than 20 simultaneous connections per IP)
limit_conn_zone $binary_remote_addr zone=per_ip_conn:10m;
limit_conn per_ip_conn 20;

# Request rate limit (maximum 20 requests per second per IP)
limit_req_zone $binary_remote_addr zone=per_ip_req:10m rate=20r/s;

# Burst parameter, improving user experience (no immediate rate limiting during burst access)
limit_req zone=per_ip_req burst=40 nodelay;

```
