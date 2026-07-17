---
title: Debian 安装 docker
author: Lee
---

## 安装docker

### 更新软件包索引

```bash
sudo apt update
```

### 安装依赖包

```bash
sudo apt install apt-transport-https ca-certificates curl software-properties-common
```

### 添加 Docker 官方的 GPG 密钥

```bash
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

### 添加 Docker 官方 APT 仓库源

```bash
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### 重新更新索引

```bash
sudo apt update
```

### 安装 Docker

```bash
sudo apt install docker-ce docker-ce-cli containerd.io
```

### 启动并设置为开机自启

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

### 验证是否正常运行

```bash
sudo docker --version
```

正确安装时会输出版本号

## 安装 Docker Compose

可选项，根据需求决定是否安装

```bash
sudo apt install docker-compose
```

安装完成后，运行以下命令验证安装：

```bash
docker-compose --version
```
