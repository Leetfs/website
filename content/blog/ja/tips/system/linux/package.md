---
title: パッケージビルドと修正ガイド
author: リー
---

## obsの設定

省略

## プル

```bash
osc co home:Lee/xxx && cd $_
osc up -S

rm -f _service;for file in `ls`;do new_file=${file##*:};mv $file $new_file;done
```

## ビルド

```bash
osc build --no-verify --clean amd64 x86_64
osc build --no-verify --clean riscv64 riscv64
```

## パッケージ内容の確認

```bash
rpm -qpl /var/tmp/build-root/..../.rpm
```

## パッケージのアーキテクチャを確認する

```bash
rpm -qp --queryformat '%{ARCH}\n' libraw-0.22.0-1.or.riscv64.rpm
```

## podmanコンテナ内でテスト実行する

```bash
podman run --rm -it -v /あなたの/RPM/パス/:/mnt:z system:amd64 /bin/bash
podman run --rm -it -v /あなたの/RPM/パス/:/mnt:z system:riscv64 /bin/bash

ls -F /mnt
dnf install /mnt/*.rpm
```

## rawイメージをpodmanにインポートする方法

```bash
# イメージをループデバイスに関連付ける
sudo losetup -Pf --show system-virt_riscv64.raw

# 一時マウントポイントを作成
mkdir -p ./tmp_root
# 二番目のパーティション（ルートパーティション）をマウント
sudo mount /dev/loop0p2 ./tmp_root
# 古いイメージを削除
podman rmi system:riscv64
# ファイルを抽出してインポート
# --numeric-ownerを追加して権限IDを元の状態に保つ
sudo tar -C ./tmp_root --numeric-owner -cf - . | podman import - system:riscv64

# マウントをクリーンアップ
sudo umount ./tmp_root
sudo losetup -d /dev/loop0
rmdir ./tmp_root

# 起動テスト
podman run -it --rm system:riscv64 /bin/sh
```
