---
title: DN42ピアリングチュートリアル
author: リー
---

## 概要

DN42は、BGP、whoisデータベース、DNSなどのさまざまなインターネット技術を採用した大規模な動的仮想プライベートネットワーク（VPN）です。参加者は、ネットワークトンネル（GRE、OpenVPN、WireGuard、Tinc、IPsec）を介して相互に接続し、境界ゲートウェイプロトコル（BGP）を利用してルーティング交換を行います。

DN42は、ハッカースペースやコミュニティネットワークなどのプライベートネットワークを接続するためのネットワーク知識を学ぶために使用できます。しかし、最も重要なのは、DN42でルーティング実験を行うことが非常に楽しいということです！

## WireGuardのインストール

```bash
sudo apt update
sudo apt install wireguard
```

## WireGuardキーの作成

```bash
wg genkey | tee privatekey | wg pubkey > publickey
```

## WireGuardトンネルの設定

```conf
# /etc/wireguard/wg0.conf
[Interface]
PrivateKey = xxx
Address = xxx.xxx.xxx/32  # ローカルトンネル内部アドレス
ListenPort = 51820

[Peer]
PublicKey = xxx
Endpoint = xxx.xxx.xxx:51820
AllowedIPs = xxx/32
PersistentKeepalive = 25
```

## 設定の開始/停止/再読み込み

```bash
# 開始
sudo wg-quick up wg0

# 停止
sudo wg-quick down wg0

# 再読み込み（開始してから停止）
sudo wg-quick down wg0 && sudo wg-quick up wg0

# ステータス表示
sudo wg
```
