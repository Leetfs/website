---
title: DebianでBBR輻輳制御アルゴリズムを有効にする
author: Lee
---

## マニュアルモード

`etc/sysctl.conf` ファイルを編集し、末尾に以下を追加してください：

```text
net.core.default_qdisc=fq
net.ipv4.tcp_congestion_control=bbr
```

`sysctl -p` を実行して保存・反映させます

## オートマチックモード

```text
echo -e "\nnet.core.default_qdisc=fq\nnet.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf && sysctl -p
```
