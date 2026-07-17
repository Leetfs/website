---
title: ターミナル環境でのGPG署名エラーの修正
author: Lee
---

## 問題の調査

ターミナルを使ってサーバーに接続し、Yubikey内のGPGキーでGitコミットに署名しようとした際にエラーが表示されました。簡単な調査内容：

![](/tips/system/linux/pubilc/gpg-sign-img/gpg-sign-1.png)

有効な秘密鍵が存在するか確認：

```bash
gpg --list-secret-keys --keyid-format LONG
```

![](/tips/system/linux/pubilc/gpg-sign-img/gpg-sign-2.png)

スマートカードが正しく読み取れるかテストする：

```bash
gpg --card-status
```

![](/tips/system/linux/pubilc/gpg-sign-img/gpg-sign-3.png)

GPGを直接使って署名テスト：

```bash
echo \"test\" | gpg --clearsign
```

出力結果：

```bash
-----BEGIN PGP SIGNED MESSAGE-----
Hash: SHA256

test
gpg: signing failed: Inappropriate ioctl for device
gpg: [stdin]: clear-sign failed: Inappropriate ioctl for device
```

エラーメッセージから、複数のターミナル環境ではGPGが現在使用している端末デバイスを自動認識できず、PINコードの入力プロンプトが正しくユーザーに伝わらないことが分かりました。GPG_TTY環境変数の設定で修正を試みます：

```bash
export GPG_TTY=$(tty)
```

再度署名テストを行う：

![](/tips/system/linux/pubilc/gpg-sign-img/gpg-sign-4.png)

認証ダイアログが正常に表示され、これで問題が解決されました。
