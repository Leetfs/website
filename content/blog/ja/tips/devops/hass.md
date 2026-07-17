---
title: Home Assistant リバースプロキシ＋アクセス許可IPリスト
author: Lee
---

## インストール

公式ドキュメント参照: <https://www.home-assistant.io/installation>

私はDocker composeでインストールしています。皆さんにもこの方法をおすすめします。[公式ドキュメント](https://www.home-assistant.io/installation/linux#docker-compose)

## リバースプロキシ

Home Assistantのセキュリティポリシーではリバースプロキシがデフォルトで禁止されています。`configuration.yaml` を変更します。

```yaml
# configuration.yaml
http:
  # nginxでのみSSLを設定することを推奨。内部リバースプロキシでは2重SSLは不要
  #ssl_certificate: [.crtファイル]
  #ssl_key: [.keyファイル]
  use_x_forwarded_for: true
  trusted_proxies: #リバースプロキシの許可IPリスト。該当しない場合は変更してください
    - 127.0.0.1
    - ::1
  server_host: 127.0.0.1 #このIPからのみ接続を受け付ける設定（リバースプロキシ経由のみ許可、オプション）
```

## nginx 設定

インストール： [nginx リバースプロキシ入門](https://leetfs.com/tips/nginx) を参照

証明書の取得：[CertbotでのSSL証明書自動取得](https://leetfs.com/tips/certbot)

### WebSocket

WebSocketを有効にする必要があります。有効でないと正常にアクセスできません。

```
    # リバースプロキシ設定
    location / {
        # 必要なWebSocketヘッダ
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 読み書きタイムアウト設定
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;

        # NginxがWebSocketデータをキャッシュしないようにする
        proxy_buffering off;
```

### サンプル

```
server {
    listen 443 ssl; # SSLリッスン
    listen [::]:443 ssl;

    server_name あなたのドメイン名;

    # SSL証明書パス
    ssl_certificate /etc/letsencrypt/live/;
    ssl_certificate_key /etc/letsencrypt/live/;

    # セキュリティ向上設定
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305';
    ssl_session_cache shared:SSL:10m;

    # HSTS（オプション。有効化するとHTTPSへの強制リダイレクト）
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # アップロード可能なファイルの最大サイズ上限
    client_max_body_size 20G;

    # リバースプロキシ設定
    location / {
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host $server_name;

        proxy_pass http://127.0.0.1:8123; # バックエンドサービスアドレス

        # プロキシセキュリティ向上
        proxy_set_header X-Frame-Options SAMEORIGIN;
        proxy_set_header X-XSS-Protection "1; mode=block";
        proxy_set_header X-Content-Type-Options nosniff;

        # 必要なWebSocketヘッダ
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 読み書きタイムアウト設定
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;

        # NginxがWebSocketデータをキャッシュしない
        proxy_buffering off;

        # アクセス制限設定。ローカルネットワークのみ許可
        # allow ここにIP;  # hk
        # allow ここにもIP;    #jp
        # deny all;              # その他すべて拒否
    }
}
server {
    listen 80;
    listen [::]:80;

    server_name あなたのドメイン名;

    return 301 https://$host$request_uri; # HTTPSへ永久リダイレクト
}
```
