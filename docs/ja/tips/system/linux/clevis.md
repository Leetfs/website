---
title: 使用 clevis + tpm2 自动解锁 LUKS 加密磁盘
author: Lee
---

## 引言

默认情况下每次开机均需手动输入密码，使用 tpm2 代替人工，自动授权。

## 查看加密分区名

```bash
lsblk
```

```bash{15}
lee@Lee-Ubuntu:~$ lsblk
NAME                        MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
loop0                         7:0    0     4K  1 loop  /snap/bare/5
loop1                         7:1    0  73.9M  1 loop  /snap/core22/1748
loop2                         7:2    0  11.1M  1 loop  /snap/firmware-updater/167
loop3                         7:3    0   258M  1 loop  /snap/firefox/5751
loop4                         7:4    0   516M  1 loop  /snap/gnome-42-2204/202
loop5                         7:5    0  91.7M  1 loop  /snap/gtk-common-themes/1535
loop6                         7:6    0  10.8M  1 loop  /snap/snap-store/1248
loop7                         7:7    0  44.4M  1 loop  /snap/snapd/23545
loop8                         7:8    0   568K  1 loop  /snap/snapd-desktop-integration/253
nvme0n1                     259:0    0 476.9G  0 disk
├─nvme0n1p1                 259:1    0     1G  0 part  /boot/efi
├─nvme0n1p2                 259:2    0     2G  0 part  /boot
└─nvme0n1p3                 259:3    0 473.9G  0 part
  └─dm_crypt-0              252:0    0 473.9G  0 crypt
    └─ubuntu--vg-ubuntu--lv 252:1    0 473.9G  0 lvm   /
```

得知分区名为 `/dev/nvme0n1p3`

## 安装 clevis 相关工具

```bash
sudo apt update
sudo apt install clevis clevis-luks clevis-initramfs clevis-tpm2 tpm2-tools
```

## 将 TPM 自动解锁绑定到 LUKS 分区

```bash
sudo clevis luks bind -d /dev/nvme0n1p3 tpm2 '{}' -k
```

## 验证 clevis 绑定状态

```bash
sudo clevis luks list -d /dev/nvme0n1p3
```

```bash
1: tpm2 '{"hash":"sha256","key":"ecc"}'
```

## 更新 initramfs

```bash
sudo update-initramfs -u
```
