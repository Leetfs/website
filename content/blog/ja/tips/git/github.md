---
title: 初心者のためのGitHub貢献ガイド
author: Lee
---

### 必要なツール

- vscode（任意）
- Git（任意）
- ブラウザ

## GitHub

### GitHub入門

GitHubは大規模なオープンソースコミュニティであり、お気に入りのプロジェクトに自由に貢献できます。

GitHub公式サイト: <https://github.com/>

### どのように貢献できますか？

アカウント登録（ここでは省略）

トップページを開き、検索バーで貢献したいリポジトリを探すか、リポジトリのリンクで直接ジャンプします。

![](/tips/git/github-img/image.png)

リポジトリのコードページ（トップ）で「Fork」をクリックし、自分のアカウントにリポジトリをコピーします。

![](/tips/git/github-img/image1.png) ![](/tips/git/github-img/image2.png)

自分がフォークしたリポジトリへ入ります

![](/tips/git/github-img/image3.png)

編集したいファイルを見つけて編集し、右上の保存をクリックします。

![](/tips/git/github-img/image4.png) ![](/tips/git/github-img/image5.png)

すべてのファイルの編集が終わったら、リポジトリのトップページに戻り、プルリクエストを作成します。

![](/tips/git/github-img/image6.png) ![](/tips/git/github-img/image7.png)

タイトル（必須）と説明（任意）を記入し、送信をクリックします。

![](/tips/git/github-img/image8.png)

上流リポジトリの管理者があなたのプルリクエストをマージするのを待ちます

### ちょっとしたコツ

GitHubのリポジトリページで「.」キーを押すとWeb版のVS Codeに切り替わり、このエディター内での編集がより使いやすい場合があります。

> [このリポジトリ](https://github.com/Leetfs/blog)を使って練習できます。まずは足りない句読点の補完や誤字の修正から始めましょう〜

## よくある質問

ここには新しい人を教える時によくあった質問を載せており、随時更新しています

### フォークしたリポジトリが見つからない場合は？

右上の自分のアバターをクリックし、サイドバーで「Your repositories」を選択します

![](/tips/git/github-img/image9.png)

ページ内で切り替えたいリポジトリを選択します

![](/tips/git/github-img/image10.png)

**注意：**

> リポジトリ名下の「Forked from ...」をクリックすると上流のリポジトリにジャンプできますが、通常、PR（プルリクエスト）でのみ変更を上流にプッシュできます。上流に直接プッシュする権限がない限り、それ以外はできません。

## vscodeとgitでのプッシュについて

本シリーズの他の記事をご覧ください
