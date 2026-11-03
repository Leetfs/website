---
title: 打包修包指南
author: Lee
---

## 配置obs

略

## 拉取

```bash
osc co home:Lee/xxx && cd $_
osc up -S

rm -f _service;for file in `ls`;do new_file=${file##*:};mv $file $new_file;done
```

## 构建

```bash
osc build --no-verify --clean amd64 x86_64
osc build --no-verify --clean riscv64 riscv64
```

## 查看包内内容

```bash
rpm -qpl /var/tmp/build-root/..../.rpm
```

## 确认包的架构

```bash
rpm -qp --queryformat '%{ARCH}\n' libraw-0.22.0-1.or.riscv64.rpm
```

## 在 podman 容器内测试运行

```bash
podman run --rm -it -v /你的/RPM/路径/:/mnt:z system:amd64 /bin/bash
podman run --rm -it -v /你的/RPM/路径/:/mnt:z system:riscv64 /bin/bash

ls -F /mnt
dnf install /mnt/*.rpm
```

## 如何将 raw 镜像导入 podman

```bash
# 关联镜像到 Loop 设备
sudo losetup -Pf --show system-virt_riscv64.raw

# 创建临时挂载点
mkdir -p ./tmp_root
# 挂载第二个分区 (根分区)
sudo mount /dev/loop0p2 ./tmp_root
# 清理旧镜像
podman rmi system:riscv64
# 提取文件并导入
# 加 --numeric-owner 确保权限 ID 保持原始状态
sudo tar -C ./tmp_root --numeric-owner -cf - . | podman import - system:riscv64

# 清理挂载
sudo umount ./tmp_root
sudo losetup -d /dev/loop0
rmdir ./tmp_root

# 启动测试
podman run -it --rm system:riscv64 /bin/sh
```
