---
title: Debian Configure Swap
author: Lee
---

## Create

You can use `free -h` to check the current swap usage

### Create a new swap file (set the size as needed)

```bash
sudo fallocate -l 1G /swapfile
```

### Set file permissions to root only (optional)

```bash
sudo chmod 600 /swapfile
```

### Format the file as swap space

```bash
sudo mkswap /swapfile
```

### Enable swap

```bash
sudo swapon /swapfile
```

### Enable automatic mounting

Open the etc/fstab file and add at the end:

```bash
/swapfile none swap sw 0 0
```

## Modify

### Change swap activation threshold

Open etc/sysctl.conf and modify the value after `vm.swappiness=80`.If it does not exist, add a new line.

### Change swap size

- Use `swapoff -a` to turn off swap
- Delete the previously created `swapfile`
- Repeat the creation steps
