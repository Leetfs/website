---
title: "Ubuntu: Disable Sleep on Lid Close"
author: Lee
---

## Modify File

```bash
sudo nano /etc/systemd/logind.conf
```

Find `#HandleLidSwitch=suspend` and change it to `HandleLidSwitch=ignore`

## Restart Service

```bash
service systemd-logind restart
```
