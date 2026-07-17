---
title: Install Docker on Debian
author: Lee
---

## Install docker

### Update package index

```bash
sudo apt update
```

### Install dependencies

```bash
sudo apt install apt-transport-https ca-certificates curl software-properties-common
```

### Add Docker official GPG key

```bash
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

### Add Docker official APT repository

```bash
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### Update index again

```bash
sudo apt update
```

### Install Docker

```bash
sudo apt install docker-ce docker-ce-cli containerd.io
```

### Start and enable on boot

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

### Check if running properly

```bash
sudo docker --version
```

A correct installation will output the version number

## Install Docker Compose

Optional, install as needed

```bash
sudo apt install docker-compose
```

After installation, run the following command to verify:

```bash
docker-compose --version
```
