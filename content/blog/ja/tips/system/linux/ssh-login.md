---
title: sshキーを使ってサーバーにログインし、パスワードログインを無効にする
author: Lee
---

## sshキー認証の設定

- コマンド「ssh-keygen」で鍵を生成するか、既存の鍵を使用します
- 対応する公開鍵を「root/.ssh/authorized_keys」ファイルにコピーします。

## パスワードログインを無効化

/etc/ssh/sshd_config ファイルを編集し、以下のパラメータを変更します：

```text
PubkeyAuthentication yes
PasswordAuthentication no
```

## sshサービスの再起動

```bash
sudo systemctl restart sshd
```

反映されない場合は、「etc/ssh/sshd_config.d」内の全ファイルを削除してください。
