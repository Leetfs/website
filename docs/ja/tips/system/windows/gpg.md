---
title: 在 WSL 中优雅地调用 Windows gpg4win 进行 Git 签名
author: Lee
---

## 修改/添加文件

```bash
sudo vim /etc/wsl.conf
```

```txt
[interop]
enabled=true
appendWindowsPath=true
```

## 执行

```bash
git config --global gpg.program gpg.exe
```
