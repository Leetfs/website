---
title: Display EpicGames on profile page
author: Lee
---

## Usage

There are many members in the EpicGames organization, so you may not be able to find yourself on the members page, which prevents you from setting your status.

You can run the following code on any terminal.

## Public

```shell
Invoke-RestMethod -Uri "https://api.github.com/orgs/EpicGames/public_members/your-username" -Method Put -Headers @{"Accept"="application/vnd.github.v3+json"; "Authorization"="token your-PAT-token"}
```

## Hide

```shell
Invoke-RestMethod -Uri "https://api.github.com/orgs/EpicGames/public_members/your-username" -Method Delete -Headers @{"Authorization"="token your-PAT-token"}
```
