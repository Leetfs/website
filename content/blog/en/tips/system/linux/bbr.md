---
title: Enable BBR Congestion Control Algorithm on Debian
author: Lee
---

## Manual Method

Edit the `etc/sysctl.conf` file and add the following at the end:

```text
net.core.default_qdisc=fq
net.ipv4.tcp_congestion_control=bbr
```

Run `sysctl -p` to save and apply the changes

## Automatic Method

```text
echo -e "\nnet.core.default_qdisc=fq\nnet.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf && sysctl -p
```
