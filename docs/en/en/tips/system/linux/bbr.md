---
title: Enable BBR Congestion Control Algorithm on Debian
author: Lee
---

## Manual Method

Edit `etc/sysctl.conf` and append at the end:

```text
net.core.default_qdisc=fq
net.ipv4.tcp_congestion_control=bbr
```

Run `sysctl -p` to save and apply

## Automatic Method

```text
echo -e "\nnet.core.default_qdisc=fq\nnet.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf && sysctl -p
```
