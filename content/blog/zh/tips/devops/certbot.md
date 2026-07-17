---
title: Certbot 自动获取 SSL 证书
author: Lee
---

## 安装

```bash
sudo apt update
sudo apt install certbot
```

如使用 nginx，需同步安装插件：

```bash
sudo apt install certbot python3-certbot-nginx
```

如使用 DNS 申请通配符证书，需安装插件：

```bash
sudo apt install python3-certbot-dns-cloudflare
```

## 申请证书

未使用任何 web 服务:

```bash
sudo certbot certonly -d 域名.com -d '*.域名.com'
```

### 使用 nginx

```bash
sudo certbot --nginx -d 你的域名
```

### 使用 DNS

以 cloudflare 为例:

1. cloudflare 管理账户 > 帐户 API 令牌 > API 令牌模板 > 编辑区域 DNS
1. 安装插件 `sudo apt install python3-certbot-dns-cloudflare`
1. 新建文件 `/etc/letsencrypt/cloudflare.ini` ，将此参数放入文件 `dns_cloudflare_api_token = 你的token`
1. 执行 `sudo certbot certonly -d 你的域名` ，根据提示选择使用 dns 验证。

> 申请后不建议移除 `cloudflare.ini`, certbot 需依据此文件自动续期。

## 使用证书

配置成功后会在终端输出证书和私钥路径，可填入 `ssl_certificate` 和 `ssl_certificate_key` 使用。

其余配置部分参考 [nginx 反代入门](./nginx.md)

## 查看所有证书

```bash
sudo certbot certificates
```

## 删除证书

```bash
sudo certbot delete --cert-name 证书名
```

## 注意

certbot 会自动向 nginx 的 `etc/nginx/sites-available/default` 文件添加相关配置，这可能与站点配置文件冲突，可注释掉标有 `# managed by Certbot` 的行。
