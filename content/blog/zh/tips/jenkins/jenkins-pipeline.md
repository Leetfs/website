---
title: Jenkins 声明式流水线与脚本式流水线
author: Lee
---

## 声明式流水线

*Jenkinsfile (Declarative Pipeline)*

```groovy
pipeline {
    agent any // 允许在任意节点运行；也可用 none，不指定全局 agent。
    stages {
        stage('Build') {
          agent { //指定代理节点
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

每个 stage 里只能有一个 steps，可通过 `agent { label 'master' }` 指定该 stage 的运行节点。

### 声明式流水线的特性

1. 不同 stage 使用同一 label 时，运行节点不一定相同，Jenkins 会随机分配一个该 label 下的可用节点。
1. 使用版本控制系统管理 Jenkinsfile 时，声明式流水线会在每个阶段都检出整个仓库至根目录，因此须在子节点安装 git。
1. 同一 steps 块内会继承上文，例如第一行为 `sh 'cd nya'`,第二行的工作路径则在 nya 内。

### 特性 1 的解决方案

首次调用节点时将 `env.NODE_NAME` 传入全局变量，将定义出的变量放入需使用此节点的 label 标签。

`env.NODE_NAME` 为 Jenkins 内置变量，该变量的值是运行当前阶段的节点名。

## 脚本式流水线

*Jenkinsfile (Scripted Pipeline)*

```groovy
node('master') { //指定使用 master 标签的节点
    stage('Build') {
        //
    }
    stage('Test') {
        //
    }
}
node('RVV') { //指定使用 RVV 标签的节点
    stage('Build') {
        //
    }
    stage('Test') {
      sh '喵'
      sh '喵'
    }
}
```

简单，方便，没有复杂的 `pipeline` 框架，使用 node 块控制节点运行。使用样例：<https://github.com/Leetfs/opencv-riscv-perf/blob/main/Jenkinsfile>

### 脚本式流水线的特性

1. 一条流水线里可以有多个 node，一个 node 可以同时为多个 stage 指定节点，同一个 node 块里的阶段运行时使用同一节点。
1. 使用版本控制系统管理 Jenkinsfile 时，脚本式流水线不会检出整个仓库至节点，仅读取 Jenkinsfile，想使用仓库需自行 clone。
1. 同一 steps 块内不会继承上文，例如第一行为 `sh 'cd nya'`,第二行的工作路径还在默认工作区路径，而不是 nya。
    - 多行脚本 `sh ''' 我是内容 ''' ` 不受此限，因为多行命令均在一个 sh 块内。
