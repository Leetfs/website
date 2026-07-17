---
title: WSL のよく使うコマンド
author: Lee
---

## デフォルトユーザーの設定

```bash
Debian config --default-user root
```

## システムの破棄

```bash
wsl --unregister Debian
```

## システムの作成

```bash
wsl --install -d Debian
```

## システムをシャットダウン

```bash
wsl --shutdown
```
