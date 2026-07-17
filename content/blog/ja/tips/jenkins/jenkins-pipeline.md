---
title: Jenkins 宣言型パイプラインとスクリプト型パイプライン
author: Lee
---

## 宣言型パイプライン

_Jenkinsfile（宣言型パイプライン）_

```groovy
pipeline {
    agent any // 任意のノードで実行可能；noneを指定し、グローバルagentなしにもできる。
    stages {
        stage('Build') {
          agent { // 実行ノード指定
              label 'master'
            }
            steps {
                //
            }
        }
        stage('Test') {
            steps {
                //
            }
        }
        stage('Deploy') {
            steps {
                //
            }
        }
    }
}
```

各stageにはstepsは1つだけ配置でき、`agent { label 'master' }` でそのstageの実行ノードを指定できます。

### 宣言型パイプラインの特徴

1. 異なるstageで同じlabelを指定しても、実行ノードが必ずしも同じとは限らず、Jenkinsはそのlabelに紐づく使用可能なノードをランダムで割り当てます。
2. バージョン管理システムでJenkinsfileを管理する場合、宣言型パイプラインは各ステージごとにリポジトリ全体をルートディレクトリにチェックアウトするため、サブノードにもgitのインストールが必要です。
3. 同じstepsブロック内では前のコマンドの状態を継承します。例えば、最初の行が `sh 'cd nya'` の場合、2行目は nya ディレクトリ内で実行されます。

### 特徴１への対応策

最初にノードを呼び出す際に `env.NODE_NAME` をグローバル変数に渡し、その変数を使いたいノードのlabelタグに格納します。

`env.NODE_NAME` はJenkinsの組み込み変数で、現在のステージが動作するノード名を示します。

## スクリプト型パイプライン

_Jenkinsfile（スクリプト型パイプライン）_

```groovy
node('master') { // masterラベルのノードを指定
    stage('Build') {
        //
    }
    stage('Test') {
        //
    }
}
node('RVV') { // RVVラベルのノードを指定
    stage('Build') {
        //
    }
    stage('Test') {
      sh 'にゃー'
      sh 'にゃー'
    }
}
```

シンプルで便利、`pipeline` フレームワークなしで、nodeブロックでノード実行をコントロールできます。使用例：<https://github.com/Leetfs/opencv-riscv-perf/blob/main/Jenkinsfile>

### スクリプト型パイプラインの特徴

1. 1つのパイプライン内で複数のnodeが使え、1つのnodeで複数のstageが指定可能。同じnodeブロック内の各stageは同一ノードで動作します。
2. バージョン管理でJenkinsfileを管理しても、スクリプト型パイプラインはJenkinsfileだけをノードで読み込み、リポジトリ全体は取得しません。リポジトリ内容が必要な場合は自分でcloneしてください。
3. 同じstepsブロック内でも前のコマンド状態は継承されません。例えば1行目が `sh 'cd nya'` なら、2行目の作業ディレクトリは依然としてデフォルトの作業領域です（nyaではありません）。
   - 複数行スクリプト `sh ''' 内容 ''' ` はこの制限を受けません。なぜなら複数行コマンドはひとつのshブロック内で処理されるためです。
