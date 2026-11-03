---
title: debianのswap設定
author: Lee
---

## 作成

`free -h` コマンドで現在のswap領域の利用状況を確認できます

### 新しいスワップファイルを作成する（サイズは任意）

```bash
sudo fallocate -l 1G /swapfile
```

### ファイルの権限をrootのみに設定する（オプション）

```bash
sudo chmod 600 /swapfile
```

### ファイルをスワップ領域としてフォーマットする

```bash
sudo mkswap /swapfile
```

### swapを有効化する

```bash
sudo swapon /swapfile
```

### 自動マウントを有効化する

etc/fstabファイルに入り、末尾に次の行を追加します：

```bash
/swapfile none swap sw 0 0
```

## 変更

### swapのトリガー閾値を変更する

etc/sysctl.confファイルを開き、`vm.swappiness=80`の値を変更します。もし無ければ新しく追加してください。

### swap領域のサイズを変更する

- `swapoff -a`でswapを無効化する
- 以前作成した`swapfile`を削除する
- 作成手順を再度実行する
