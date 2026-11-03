---
title: DN42 Peering 教程
author: Lee
---

## 概述

DN42 是一个大型动态虚拟专用网络（VPN），它采用了多种互联网技术（如 BGP、whois 数据库、DNS 等）。参与者通过网络隧道（GRE、OpenVPN、WireGuard、Tinc、IPsec）相互连接，并借助边界网关协议（BGP）进行路由交换。

DN42 可以用来学习网络知识以及连接私有网络，比如黑客空间或社区网络。但最重要的是，在 DN42 中进行路由实验非常有趣！

## 安装 WireGuard

```bash
sudo apt update
sudo apt install wireguard
```

## 创建 WireGuard 密钥

```bash
wg genkey | tee privatekey | wg pubkey > publickey
```

## 配置 WireGuard 隧道

```conf
# /etc/wireguard/wg0.conf
[Interface]
PrivateKey = xxx
Address = xxx.xxx.xxx/32  # 本地 tunnel 内部地址
ListenPort = 51820

[Peer]
PublicKey = xxx
Endpoint = xxx.xxx.xxx:51820
AllowedIPs = xxx/32
PersistentKeepalive = 25
```

## 启动/停止/重载配置

```bash
# 启动
sudo wg-quick up wg0

# 停止
sudo wg-quick down wg0

# 重载配置（启动再停止）
sudo wg-quick down wg0 && sudo wg-quick up wg0

# 查看状态
sudo wg
```
