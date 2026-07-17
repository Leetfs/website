---
title: WSLでWindows gpg4winをエレガントに呼び出してGit署名を行う
author: リー
---

## ファイルの変更/追加

```bash
sudo vim /etc/wsl.conf
```

```txt
[interop]
enabled=true
appendWindowsPath=true
```

## 実行

```bash
git config --global gpg.program gpg.exe
```
