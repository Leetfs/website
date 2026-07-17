---
title: Elegantly Using Windows gpg4win for Git Signing in WSL
author: Lee
---

## Modify/Add File

```bash
sudo vim /etc/wsl.conf
```

```txt
[interop]
enabled=true
appendWindowsPath=true
```

## Execute

```bash
git config --global gpg.program gpg.exe
```
