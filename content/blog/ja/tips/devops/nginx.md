---
title: nginx リバースプロキシ入門
author: Lee
---

## 概要

本チュートリアルは Debian をベースに、nginx を使って稼働中の Docker コンテナへリバースプロキシする例を示します。

### なぜリバースプロキシを使うのか？

以下はインターネットから調べたものです：

リバースプロキシはクライアントのリクエストを受け取り、それをウェブサーバーに転送し、その結果をクライアントに返すサーバーです。まるでプロキシサーバーが処理したかのように動作します。

リバースプロキシはサーバー側を代理するもので、ウェブサーバーの立場に立っています。その実際のサーバーはクライアントから見えません。これが「リバース」と呼ばれる理由です。

リバースプロキシの用途：

サーバーを保護し、サーバーの実際のIPを隠す。
負荷分散：アクセス量やサーバー負荷に応じてリクエストを異なるサーバーへ割り当てる。
静的コンテンツや、短期間に大量発生する動的リクエストのキャッシュ。
アプリケーションレイヤーのファイアウォールとして保護を提供。
SSL通信の暗号化／復号。

### 例を挙げると

例えば、サーバー上で a、b、c の3つのサイトを運用したいとします。これらはどれも443番ポートが必要ですが、サーバーのIPは1つしかなく、443を3つに分けることはできません。

このときリバースプロキシnginxが443番ポートを一括管理し、a.leetfs.comでアクセスするユーザーはサイトaへ、b.leetfs.com経由のユーザーはサイトbへ、cも同じように振り分けます。

## インストール

1. システムインデックスを更新する: `sudo apt update`
2. nginx をインストール: `sudo apt install nginx`

インストール完了後、Nginx は自動的に起動し、起動時に有効になります。`sudo systemctl status nginx` で nginx の状態を確認できます。

## nginx の設定

- デフォルトの設定ファイル: `/etc/nginx/nginx.conf`
- サイト設定ディレクトリ: `/etc/nginx/sites-available/`
- 実際に有効化されている設定ファイルの保存先: `etc/nginx/sites-enabled/`

続いて `/etc/nginx/sites-available/` ディレクトリを編集し、nginxを設定します。

## Docker へのリバースプロキシ

ホスト上で docker で weblate サービスを動かしており、このコンテナが443番ポートを直接使用するのはスマートではありません。この場合、443番ポートはその一つのサービスのみに使用されてしまいます。

> このセクションを読むには docker の基礎知識が少し必要です。

### dockerfileの設定

このコンテナのdockerfileを見てみましょう。ports の下にある `- 443:4443` はサーバーの443番ポートで受信し、それをこの docker コンテナの 4443 番ポートへ転送することを意味します。

```yaml
services:
  weblate:
    ports:
      - 443:4443
    environment:
# ...以下省略
```

443という標準のhttpsポートを、サーバーで未使用の他のポート、例えば `- 4443:4443` に変更し、変更後はコンテナを再読み込みして適用します。

## nginx 設定ファイルの編集

サイト設定ディレクトリ `/etc/nginx/sites-available/` に移動し、新しい設定ファイルを作成します。ここではファイル名を `weblate` とします。

設定ファイルの内容は以下のコードを参考にしてください：

```nginx
server {
    listen 443 ssl; # sslはssl暗号化を使用することを示す
    listen [::]:443 ssl;

    server_name leetfs.com; # リバースプロキシしたいドメイン

    ssl_certificate /var/lib/docker/volumes/weblate-docker_weblate-data/_data/ssl/fullchain.pem; # ssl証明書
    ssl_certificate_key /var/lib/docker/volumes/weblate-docker_weblate-data/_data/ssl/privkey.pem; # ssl秘密鍵

    ssl_protocols TLSv1.2 TLSv1.3;  # TLSv1.2とTLSv1.3を有効化し、SSLv3等の古いプロトコルは無効化
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';  # 推奨暗号スイート
    ssl_prefer_server_ciphers on;  # サーバー側の暗号スイートを優先

    location / {
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host $server_name;

        proxy_pass https://127.0.0.1:4443; # 上記設定でコンテナの転送ポートを4443にしたためここも4443。127.0.0.1はサーバー自身を示します。

        # 代理のセキュリティを高める
        proxy_set_header X-Frame-Options SAMEORIGIN;
        proxy_set_header X-XSS-Protection "1; mode=block";
        proxy_set_header X-Content-Type-Options nosniff;
    }
}

```

設定ファイルを編集後、シンボリックリンクを作成し設定ファイルを有効化します（weblate を各自のファイル名に置き換えてください）

```bash
sudo ln -s /etc/nginx/sites-available/weblate /etc/nginx/sites-enabled/
```

- 設定ファイルが正しいかテスト: `sudo nginx -t`
- Nginx 設定を再読み込み: `sudo systemctl reload nginx`

### 証明書の取得

先ほどの `ssl_certificate` と `ssl_certificate_key` には証明書と秘密鍵パスを記入してください。[Certbotによる自動SSL証明書取得](https://leetfs.com/tips/certbot) を参考にしてください。

## サイト設定の無効化

特定サイトの設定を無効化したい場合は、シンボリックリンクを削除するだけで本体ファイルを消す必要はありません。再利用も簡単です。

```bash
sudo rm /etc/nginx/sites-enabled/ファイル名
```

作業完了後は必ずNginx設定を再読み込みしてください: `sudo systemctl reload nginx`

## 同時接続/リクエストレート制限を追加

httpブロックの下に配置します。

```bash
# etc/nginx/nginx.conf

# 同時接続制限（1IPあたりの同時接続数は20を超えない）
limit_conn_zone $binary_remote_addr zone=per_ip_conn:10m;
limit_conn per_ip_conn 20;

# リクエストレート制限（1IPあたりのリクエストは秒間20回まで）
limit_req_zone $binary_remote_addr zone=per_ip_req:10m rate=20r/s;

# バーストパラメータ、ユーザーエクスペリエンスを向上（バーストアクセス時に即時制限しない）
limit_req zone=per_ip_req burst=40 nodelay;

```
