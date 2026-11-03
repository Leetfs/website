---
title: GitHub PR 常见问题
author: Lee
---

## 概述

本章用于存放新手容易出现的问题，如有疑问，欢迎[联系作者](https://github.com/Leetfs)。

## 在我的 PR 被合并前仓库内有了新的提交怎么办？

如果没有合并冲突，可以不理会；如果有合并冲突，需要先解决合并冲突。

## 当我的 PR 被合并后，我想发起新的 PR

切记不可在原分支上直接提交，会导致合并冲突。

### 方案1

可以将分支更新到最新版本

(这两个按钮都有效，第一个为更新到最新版本并舍弃你本地仓库上的提交，第二个为更新到最新版本)
![](/tips/git/github-img/image11.png)

### 方案2

基于上游仓库开一个新的分支，在新的分支进行提交

![](/tips/git/github-img/image12.png)
![](/tips/git/github-img/image13.png)

## 提交以后如何修改

PR 合并前分支和 PR 是绑定的，直接在对应分支修改即可。

## 如何审核 PR

进入 PR，点击 `Files changed`

![](/tips/git/github-img/image14.png)

点击 `Review changes`

![](/tips/git/github-img/image15.png)
