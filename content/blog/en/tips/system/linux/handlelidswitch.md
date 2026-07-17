---
title: Ubuntu settings to prevent sleep when lid is closed
author: Lee
---

## File modifications

```bash
sudo nano /etc/systemd/logind.conf
```

Find `#HandleLidSwitch=suspend` and change it to `HandleLidSwitch=ignore`

## Restart service

```bash
service systemd-logind restart
```
