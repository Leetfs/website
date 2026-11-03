---
title: Debian 开启 BBR 拥塞控制算法
author: Lee
---

## 手动挡

编辑 `etc/sysctl.conf` 文件，在末尾加入：

```text
net.core.default_qdisc=fq
net.ipv4.tcp_congestion_control=bbr
```

执行 `sysctl -p` 保存并生效

## 自动挡

```text
echo -e "\nnet.core.default_qdisc=fq\nnet.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf && sysctl -p
```
