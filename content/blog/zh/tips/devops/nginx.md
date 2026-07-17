---
title: nginx 反代入门
author: Lee
---

## 概述

本教程基于 debian，使用 nginx 反代到正在运行的 docker 容器举例。

### 为什么要反代？

以下是网上搜的：

反向代理是一种服务器，它接受客户端的请求，将请求转发给网络服务器，然后将结果返回给客户端，就像代理服务器处理了请求一样。

反向代理代理的是服务器，是和网络服务器站在一方的。其真实服务器对于客户端不可见。这就是它叫“反向”的原因。

反向代理可用于:

保护服务器，隐藏服务器真实 IP。
负载均衡，根据访问流量和服务器负载情况，将请求分发到不同服务器上。
缓存静态内容以及部分短时间的大量动态请求。
作为应用层防火墙提供防护。
加密/解密 SSL 通信。

### 举个例子

例如 我们要在服务器上运行 a b c 三个网站，这三个网站均需要使用 443 端口，但我们的服务器只有一个ip，没办法分出来三个443.

这个时候：反代出现了，由 nginx 统一接管 443 端口，将通过 a.leetfs.com 访问的用户转到站点a，将通过 b.leetfs.com 访问的用户转到网站b，c也同理。

## 安装

1. 更新系统索引 `sudo apt update`
1. 安装 nginx `sudo apt install nginx`

安装完成后，Nginx 会自动启动并设置为开机自启，可通过 `sudo systemctl status nginx` 检查 nginx 的状态。

## 配置 nginx

- 默认配置文件: `/etc/nginx/nginx.conf`
- 网站配置目录: `/etc/nginx/sites-available/`
- 用于存放实际启用的配置文件: `etc/nginx/sites-enabled/`

接下来，我们将通过修改 `/etc/nginx/sites-available/` 目录来配置 nginx。

## 反代到 docker

我们的主机上通过 docker 运行了 weblate 服务，该容器默认直接接管服务器 443 端口太不优雅，会导致这台服务器的 443 端口只能跑这一个服务。

> 阅读此章节需要您略微了解 docker。

### 配置 dockerfile

让我们观测这个容器的 dockerfile，ports下方的 `- 443:4443` 代表监听服务器的 443 端口，并将收到的请求转发到这个 docker 容器所使用的 4443 端口上。

```yaml
services:
  weblate:
    ports:
      - 443:4443
    environment:
# ...后面略
```

我们先将 443 这个标准 https 端口改为服务器没有被占用的其它端口，例如 `- 4443:4443`，修改后重载容器，应用更改。

## 修改 nginx 配置文件

切换到网站配置目录: `/etc/nginx/sites-available/`，新建一个配置文件，这里我取名叫 `weblate`

配置文件内容参考以下代码：

```nginx
server {
    listen 443 ssl; # ssl代表使用ssl加密
    listen [::]:443 ssl;

    server_name leetfs.com; # 需要反代的域名

    ssl_certificate /var/lib/docker/volumes/weblate-docker_weblate-data/_data/ssl/fullchain.pem; # ssl证书
    ssl_certificate_key /var/lib/docker/volumes/weblate-docker_weblate-data/_data/ssl/privkey.pem; # ssl私钥

    ssl_protocols TLSv1.2 TLSv1.3;  # 启用 TLSv1.2 和 TLSv1.3，禁用 SSLv3 和过时的协议
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';  # 推荐的加密套件
    ssl_prefer_server_ciphers on;  # 优先使用服务器的加密套件

    location / {
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host $server_name;

        proxy_pass https://127.0.0.1:4443; # 需要反代到的位置，因为我们上文将容器转发端口配置为了4443，故这里使用4443。127.0.0.1代表服务器自己。

        # 增强代理安全性
        proxy_set_header X-Frame-Options SAMEORIGIN;
        proxy_set_header X-XSS-Protection "1; mode=block";
        proxy_set_header X-Content-Type-Options nosniff;
    }
}

```

修改配置文件后创建一个符号链接，将该配置文件启用（记得把 weblate 换成你自己的文件名）

```bash
sudo ln -s /etc/nginx/sites-available/weblate /etc/nginx/sites-enabled/
```

- 测试配置文件是否正确：`sudo nginx -t`
- 重新加载 Nginx 配置: `sudo systemctl reload nginx`

### 获取证书

上文中 `ssl_certificate` 和 `ssl_certificate_key` 需填入证书和私钥路径，参考 [Certbot 自动获取 SSL 证书](https://leetfs.com/tips/certbot)

## 禁用站点配置

如果想禁用某个站点的设置，仅需删除符号链接，而无需移除文件本体，便于以后复用。

```bash
sudo rm /etc/nginx/sites-enabled/文件名
```

搞定后记得重载 Nginx 配置: `sudo systemctl reload nginx`

## 添加并发连接/请求速率限制

放到 http 块下。

```bash
# etc/nginx/nginx.conf

# 并发连接限制（每 IP 同时连接数不超过 20）
limit_conn_zone $binary_remote_addr zone=per_ip_conn:10m;
limit_conn per_ip_conn 20;

# 请求速率限制（每 IP 每秒最多 20 次请求）
limit_req_zone $binary_remote_addr zone=per_ip_req:10m rate=20r/s;

# 突发参数，提高用户体验（突发访问时不立即限流）
limit_req zone=per_ip_req burst=40 nodelay;

```
