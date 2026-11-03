---
title: debian 配置 swap
author: Lee
---

## 创建

可使用 `free -h` 检查当前 swap 分区的使用情况

### 创建一个新的交换文件（大小自己填）

```bash
sudo fallocate -l 1G /swapfile
```

### 设置文件权限为仅root（可选）

```bash
sudo chmod 600 /swapfile
```

### 格式化文件为交换空间

```bash
sudo mkswap /swapfile
```

### 启用 swap

```bash
sudo swapon /swapfile
```

### 启用自动挂载

进入 etc/fstab 文件，在末尾加入：

```bash
/swapfile none swap sw 0 0
```

## 修改

### 修改 swap 触发阈值

进入 etc/sysctl.conf 文件，修改 `vm.swappiness=80` 后面的值。如果没有自己加一条进去。

### 修改 swap 空间大小

- 使用 `swapoff -a` 关闭 swap
- 删掉之前创建的 `swapfile`
- 重新执行创建流程
