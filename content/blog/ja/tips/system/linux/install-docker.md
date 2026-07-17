---
title: Debian での Docker インストール
author: Lee
---

## Docker のインストール

### パッケージインデックスを更新する

```bash
sudo apt update
```

### 依存パッケージのインストール

```bash
sudo apt install apt-transport-https ca-certificates curl software-properties-common
```

### Docker公式のGPGキーを追加

```bash
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

### Docker公式APTリポジトリを追加

```bash
echo \"deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable\" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### インデックスを再度更新する

```bash
sudo apt update
```

### Docker のインストール

```bash
sudo apt install docker-ce docker-ce-cli containerd.io
```

### Docker を起動し、自動起動を設定

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

### 正常に動作しているか確認する

```bash
sudo docker --version
```

正しくインストールされている場合、バージョンが表示されます

## Docker Compose のインストール

オプションです。必要に応じてインストールしてください。

```bash
sudo apt install docker-compose
```

インストールが完了したら、以下のコマンドでインストールを確認してください：

```bash
docker-compose --version
```
