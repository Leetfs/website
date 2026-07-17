---
title: 将 EpicGames 公开到个人资料页
author: Lee
---

## 用处

EpicGames 组织人数众多，可能无法在成员页搜索到自己，导致无法设置状态。

可使用任意终端执行以下代码。

## 公开

```shell
Invoke-RestMethod -Uri "https://api.github.com/orgs/EpicGames/public_members/你的用户名" -Method Put -Headers @{"Accept"="application/vnd.github.v3+json"; "Authorization"="token 你的PAT密钥"}
```

## 隐藏

```shell
Invoke-RestMethod -Uri "https://api.github.com/orgs/EpicGames/public_members/你的用户名" -Method Delete -Headers @{"Authorization"="token 你的PAT密钥"}
```
