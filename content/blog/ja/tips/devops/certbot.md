---
title: Certbot 自動取得 SSL 証明書
author: Lee
---

## インストール

```bash
sudo apt update
sudo apt install certbot
```

nginx を使用する場合、プラグインも同時にインストールしてください：

```bash
sudo apt install certbot python3-certbot-nginx
```

DNS を利用してワイルドカード証明書を申請する場合、プラグインをインストールしてください：

```bash
sudo apt install python3-certbot-dns-cloudflare
```

## 証明書を申請

いかなる Web サービスも利用していない場合：

```bash
sudo certbot certonly -d ドメイン.com -d '*.ドメイン.com'
```

### nginx を使う

```bash
sudo certbot --nginx -d あなたのドメイン
```

### DNS を使う

cloudflare を例に：

1. cloudflare マネージメントアカウント ＞ アカウント API トークン ＞ API トークンテンプレート ＞ ゾーン DNS の編集
2. プラグインのインストール `sudo apt install python3-certbot-dns-cloudflare`
3. 新しくファイル `/etc/letsencrypt/cloudflare.ini` を作成し、このパラメータ `dns_cloudflare_api_token = あなたのトークン` を記入します
4. `sudo certbot certonly -d あなたのドメイン` を実行し、指示に従って dns 検証を選択してください。

> 申請後は `cloudflare.ini` を削除しないことを推奨します。certbot により自動更新が必要です。

## 証明書の利用

設定が成功すると、ターミナルに証明書と秘密鍵のパスが表示されます。そのパスを `ssl_certificate` および `ssl_certificate_key` に入力して利用できます。

その他の設定については [nginx リバースプロキシ入門](./nginx.md) を参照してください

## すべての証明書を表示

```bash
sudo certbot certificates
```

## 証明書を削除

```bash
sudo certbot delete --cert-name 証明書名
```

## 注意

certbot は nginx の `etc/nginx/sites-available/default` ファイルに自動で関連設定を追加しますが、これはサイト設定ファイルと衝突する場合があります。`# managed by Certbot` のある行はコメントアウトしてください。
