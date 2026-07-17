---
title: Git の簡単入門
author: Lee
---

## インストール

### Windows / macOS

<https://git-scm.com/downloads>

### Linux

```bash
sudo apt update
sudo apt install git
```

## 使用方法

インストール後、任意のターミナルで Git 関連のコマンドを実行できます。また、vscode のように Git プラグインが組み込まれているエディタを使って、Git を視覚的に管理することも可能です。

Git を使用する際は、[作業ディレクトリ](https://ja.wikipedia.org/wiki/%E3%83%AF%E3%83%BC%E3%82%AF%E3%83%87%E3%82%A3%E3%83%AC%E3%82%AF%E3%83%88%E3%83%AA)の概念を理解しておく必要があります。作業ディレクトリは現在ターミナルやウィンドウが位置している場所であり、一部のコマンドが作用する場所です。

たとえば、`cd lee` を使って現在のフォルダー内の `lee` フォルダーに移動すると、この状態で `git clone` を実行すると、`blog` リポジトリが `lee` フォルダーにクローンされます。

### ユーザー名とメールアドレスの設定

```bash
git config --global user.name "username" # ユーザー名を設定
git config --global user.email useremail@qq.com # メールアドレスを設定
```

### ブランチをチェックアウト

```bash
git branch # 現在のブランチを表示
git checkout ブランチ名 # ブランチをチェックアウト
```

### リポジトリのクローン

```bash
git clone リポジトリURL
```

```bash
git clone https://github.com/Leetfs/blog
```

例：本リポジトリのURLは <https://github.com/Leetfs/blog> です。

```bash
git clone https://github.com/Leetfs/blog ./lee-blog
```

clone したリポジトリはデフォルトで現在の作業ディレクトリに配置され、デフォルトのフォルダー名はリポジトリ名になります。このコマンドの意味は、Git でクローンしたリポジトリをこのディレクトリ内の lee-blog フォルダーに保存するということです。

> ヒント: / で始まるパスはルートディレクトリから始まり、たとえば /lee はルート直下のlee、./lee は現在の作業ディレクトリ内のleeを示します。

### リモートリポジトリ

```bash
git remote add カスタムリモートリポジトリ名 https://github.com/example/source.git # リモートリポジトリを追加
git fetch リモートリポジトリ名 # リモートリポジトリをローカルにプル
git branch -a # すべてのブランチをリスト
git checkout -b 新しいブランチ名 リモートリポジトリ名/リモートブランチ名 # リモートブランチに基づいて新しいローカルブランチをチェックアウト
git switch feature # リモートブランチに基づいて新しいローカルブランチをチェックアウト（簡略化された操作）
```

### cherry-pick

`git cherry-pick`を使用すると、他のブランチ/リポジトリから1つ以上のコミットを選択し、これらのコミットを現在のブランチに「コピー」して、新しいコミットを作成できます。

```bash
git checkout ターゲットブランチ
git cherry-pick <開始ハッシュ>^..<終了ハッシュ>
git cherry-pick --skip # 現在の衝突コミットをスキップ
git cherry-pick --abort # cherry-pickを放棄（以前の状態に戻る）
```

### ステージ／プッシュ／プル

一般的な作業フロー：

```bash
git pull # 最新バージョンを取得
git add . # フォルダー内のすべてのファイルをステージ
git commit -m "ここにコミットメッセージ。何を変更したか簡単に説明、日本語も可。（必須）" # ステージした変更をコミット
git push # リモートにプッシュ
```

この後はまだ書いていません。続きは後日掲載します。
