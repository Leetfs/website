---
title: Ubuntu 設定で蓋を閉じてもスリープしない
author: リー
---

## 変更ファイル

```bash
sudo nano /etc/systemd/logind.conf
```

`#HandleLidSwitch=suspend` を見つけて、`HandleLidSwitch=ignore` に変更する

## サービスを再起動する

```bash
service systemd-logind restart
```
