---
title: Git 的简单入门
author: Lee
---

## 安装

### Windows / macos

<https://git-scm.com/downloads>

### Linux

```bash
sudo apt update
sudo apt install git
```

## 使用

安装后可在任意终端执行 Git 相关命令，也可使用 vscode 这样的自带 Git 插件的编辑器可视化管理 Git。

使用 Git 时我们需要明白[工作路径](https://zh.wikipedia.org/wiki/%E5%B7%A5%E4%BD%9C%E7%9B%AE%E9%8C%84)的概念，工作路径为当前终端/窗口所在的位置，也是部分命令操作所工作的位置。

例如我们可以使用 `cd lee` 切换到当前文件夹下的 `lee` 文件夹，此时运行 `git clone` 会将 `blog` 仓库克隆到 `lee` 文件夹中。

### 设置用户名和邮箱

```bash
git config --global user.name "username" # 设置用户名
git config --global user.email useremail@qq.com # 设置邮箱
```

### 检出分支

```bash
git branch # 查看当前有哪些分支
git checkout 分支名 # 检出分支
```

### 克隆仓库

```bash
git clone 仓库url
```

```bash
git clone https://github.com/Leetfs/blog
```

例：本仓库的 url 为 <https://github.com/Leetfs/blog>

```bash
git clone https://github.com/Leetfs/blog ./lee-blog
```

clone 的仓库默认放在当前工作路径下，默认文件夹名为仓库名。此命令的含义为将 Git clone 下来的仓库存放在本目录下的 lee-blog 文件夹。

> tips: / 开头的路径表示从根目录开始，例如 /lee 代表根目录下的lee，./lee 代表当前工作路径下的lee

### 远程仓库

```bash
git remote add 自定义远程仓库名 https://github.com/example/source.git # 添加远程仓库
git fetch 远程仓库名 # 把远程仓库拉到本地
git branch -a # 列出所有分支
git checkout -b 新分支名 远程仓库名/远程分支名 # 基于远程分支检出一个本地新分支
git switch feature # 基于远程分支检出一个本地新分支（简化操作）
```

### cherry-pick

使用 `git cherry-pick` 可从其他分支/仓库挑选一个或多个提交，把这些提交“复制”到当前分支，产生新的提交。

```bash
git checkout 目标分支
git cherry-pick <起始哈希>^..<结束哈希>
git cherry-pick --skip # 跳过当前冲突的提交
git cherry-pick --abort # 放弃 cherry-pick（回退到之前状态）
```

### 缓存/推/拉

一个常见的工作流程：

```bash
git pull # 拉取最新版本
git add . # 暂存文件夹下所有文件
git commit -m "这里放提交消息，简要描述你改了什么，不限制语言。（必填）" # 提交暂存的修改
git push #推送到远程
```

后面没写，未完待续。
