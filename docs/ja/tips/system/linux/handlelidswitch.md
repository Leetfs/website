---
title: Ubuntu 设置合盖不休眠
author: Lee
---

## 修改文件

```bash
sudo nano /etc/systemd/logind.conf
```

找到 `#HandleLidSwitch=suspend`，改为 `HandleLidSwitch=ignore`

## 重启服务

```bash
service systemd-logind restart
```
