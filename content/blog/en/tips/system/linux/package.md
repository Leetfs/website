---
title: Package Building and Repair Guide
author: Lee
---

## Configure OBS

Omitted

## Pull

```bash
osc co home:Lee/xxx && cd $_
osc up -S

rm -f _service;for file in `ls`;do new_file=${file##*:};mv $file $new_file;done
```

## Build

```bash
osc build --no-verify --clean amd64 x86_64
osc build --no-verify --clean riscv64 riscv64
```

## View Package Contents

```bash
rpm -qpl /var/tmp/build-root/..../.rpm
```

## Confirm package architecture

```bash
rpm -qp --queryformat '%{ARCH}\n' libraw-0.22.0-1.or.riscv64.rpm
```

## Test run inside podman container

```bash
podman run --rm -it -v /你的/RPM/路径/:/mnt:z system:amd64 /bin/bash
podman run --rm -it -v /你的/RPM/路径/:/mnt:z system:riscv64 /bin/bash

ls -F /mnt
dnf install /mnt/*.rpm
```

## How to import a raw image into podman

```bash
# Associate image with Loop device
sudo losetup -Pf --show system-virt_riscv64.raw

# Create temporary mount point
mkdir -p ./tmp_root
# Mount the second partition (root partition)
sudo mount /dev/loop0p2 ./tmp_root
# Clean up old image
podman rmi system:riscv64
# Extract files and import
# Add --numeric-owner to ensure permission IDs remain in original state
sudo tar -C ./tmp_root --numeric-owner -cf - . | podman import - system:riscv64

# Clean up mount
sudo umount ./tmp_root
sudo losetup -d /dev/loop0
rmdir ./tmp_root

# Start test
podman run -it --rm system:riscv64 /bin/sh
```
