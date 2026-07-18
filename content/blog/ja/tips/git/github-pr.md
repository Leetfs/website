---
title: GitHub PR よくある質問
author: Lee
---

## 概要

この章では初心者が直面しやすい問題をまとめています。 ご不明点があれば、[著者までご連絡ください](https://github.com/Leetfs)。

## 自分のPRがマージされる前にリポジトリに新しいコミットが追加された場合はどうすればいいですか？

如果没有合并冲突，可以不理会；如果有合并冲突，需要先解决合并冲突。

## 当我的 PR 被合并后，我想发起新的 PR

切记不可在原分支上直接提交，会导致合并冲突。

### 方法1

ブランチを最新版に更新できます

（この2つのボタンはどちらも有効です。 1つ目は最新版へ更新しローカルのコミットを破棄します。 2つ目は最新版へのみ更新します）
![](/tips/git/github-img/image11.png)

### 方法2

上流リポジトリから新しいブランチを作成し、その新しいブランチでコミットします

![](/tips/git/github-img/image12.png)
![](/tips/git/github-img/image13.png)

## 提交以后如何修改

PR 合并前分支和 PR 是绑定的，直接在对应分支修改即可。

## PRのレビュー方法

PRを開き、`Files changed`をクリックします

![](/tips/git/github-img/image14.png)

`Review changes`をクリックします

![](/tips/git/github-img/image15.png)
