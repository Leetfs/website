---
title: clevis + tpm2を使用してLUKS暗号化ディスクの自動ロック解除を行う
author: リー
---

## はじめに

デフォルトでは、起動するたびに手動でパスワードを入力する必要があります。tpm2を使用して、手動の代わりに自動で認証を行います。

## 暗号化されたパーティション名を確認する

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

パーティション名が `/dev/nvme0n1p3` であることを確認しました

## clevis関連ツールのインストール

```bash
sudo apt update
sudo apt install clevis clevis-luks clevis-initramfs clevis-tpm2 tpm2-tools
```

## TPM自動ロック解除をLUKSパーティションにバインドする

```bash
sudo clevis luks bind -d /dev/nvme0n1p3 tpm2 '{}' -k
```

## clevisバインド状態の確認

```bash
sudo clevis luks list -d /dev/nvme0n1p3
```

```bash
1: tpm2 '{"hash":"sha256","key":"ecc"}'
```

## initramfsの更新

```bash
sudo update-initramfs -u
```
