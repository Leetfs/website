---
title: Home Assistant 反代 + 访问白名单
author: Lee
---

## 安装

参考官方文档: <https://www.home-assistant.io/installation>

我使用 Docker compose 安装，推荐大家也使用此方案。[官方文档](https://www.home-assistant.io/installation/linux#docker-compose)

## 反代

Home Assistant 的安全策略默认禁止反代，修改 `configuration.yaml`

```yaml
# configuration.yaml
http:
  # 建议仅在nginx配置ssl，内部反代没必要配两层ssl
  #ssl_certificate: [.crt文件]
  #ssl_key: [.key文件]
  use_x_forwarded_for: true
  trusted_proxies: #反代白名单，如不是此ip自行更改即可
    - 127.0.0.1
    - ::1
  server_host: 127.0.0.1 #仅监听来自此ip的访问，用于设置仅可通过反代访问（可选）
```

## nginx 配置

安装：参考 [nginx 反代入门](https://leetfs.com/tips/nginx)

获取证书：[Certbot 自动获取 SSL 证书](https://leetfs.com/tips/certbot)

### WebSocket

必须启用 WebSocket，否则无法正常访问

```
    # 反向代理配置
    location / {
        # 必需的 WebSocket 头部
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 读写超时时间配置
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;

        # 防止 Nginx 缓存 WebSocket 数据
        proxy_buffering off;
```

### 样例

```
server {
    listen 443 ssl; # SSL 监听
    listen [::]:443 ssl;

    server_name 你的域名;

    # SSL 证书路径
    ssl_certificate /etc/letsencrypt/live/;
    ssl_certificate_key /etc/letsencrypt/live/;

    # 安全性优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305';
    ssl_session_cache shared:SSL:10m;

    # HSTS（可选，启用后强制 HTTPS 访问）
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # 限制文件上传大小
    client_max_body_size 20G;

    # 反向代理配置
    location / {
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host $server_name;

        proxy_pass http://127.0.0.1:8123; # 后端服务地址

        # 增强代理安全性
        proxy_set_header X-Frame-Options SAMEORIGIN;
        proxy_set_header X-XSS-Protection "1; mode=block";
        proxy_set_header X-Content-Type-Options nosniff;

        # 必需的 WebSocket 头部
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 读写超时时间配置
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;

        # 防止 Nginx 缓存 WebSocket 数据
        proxy_buffering off;

        # 限制访问，仅允许局域网内访问
        # allow 这里是ip;  # hk
        # allow 这里也是ip;    #jp
        # deny all;              # 拒绝其他所有请求
    }
}
server {
    listen 80;
    listen [::]:80;

    server_name 你的域名;

    return 301 https://$host$request_uri; # 永久跳转到 HTTPS
}
```
