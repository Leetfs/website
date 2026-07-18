---
title: DN42 Peering Tutorial
author: Lee
---

## Overview

DN42 is a large dynamic virtual private network (VPN) that employs various internet technologies (such as BGP, whois database, DNS, etc.).Participants connect to each other via network tunnels (GRE, OpenVPN, WireGuard, Tinc, IPsec) and exchange routes with the help of the Border Gateway Protocol (BGP).

DN42 can be used to learn about networking and to connect private networks, such as hacker spaces or community networks.But most importantly, experimenting with routing in DN42 is a lot of fun!

## Install WireGuard

```bash
sudo apt update
sudo apt install wireguard
```

## Create WireGuard Keys

```bash
wg genkey | tee privatekey | wg pubkey > publickey
```

## Configure WireGuard Tunnel

```conf
# /etc/wireguard/wg0.conf
[Interface]
PrivateKey = xxx
Address = xxx.xxx.xxx/32  # Local tunnel internal address
ListenPort = 51820

[Peer]
PublicKey = xxx
Endpoint = xxx.xxx.xxx:51820
AllowedIPs = xxx/32
PersistentKeepalive = 25
```

## Start/Stop/Reload Configuration

```bash
# Start
sudo wg-quick up wg0

# Stop
sudo wg-quick down wg0

# Reload configuration (start then stop)
sudo wg-quick down wg0 && sudo wg-quick up wg0

# View status
sudo wg
```
