---
title: EpicGamesをプロフィールページに公開する
author: Lee
---

## 用途

EpicGamesの組織メンバーは多数いるため、メンバーページで自分が検索できず、ステータスを設定できない場合があります。

任意の端末で以下のコードを実行できます。

## 公開

```shell
Invoke-RestMethod -Uri "https://api.github.com/orgs/EpicGames/public_members/あなたのユーザー名" -Method Put -Headers @{"Accept"="application/vnd.github.v3+json"; "Authorization"="token あなたのPATキー"}
```

## 非公開

```shell
Invoke-RestMethod -Uri "https://api.github.com/orgs/EpicGames/public_members/あなたのユーザー名" -Method Delete -Headers @{"Authorization"="token あなたのPATキー"}
```
