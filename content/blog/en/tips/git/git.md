---
title: Simple Git Introduction
author: Lee
---

## Installation

### Windows / macOS

<https://git-scm.com/downloads>

### Linux

```bash
sudo apt update
sudo apt install git
```

## Usage

After installation, you can run Git-related commands in any terminal, or use an editor like VS Code that has built-in Git plugins to visually manage Git.

When using Git, it's important to understand the concept of the [working directory](https://zh.wikipedia.org/wiki/%E5%B7%A5%E4%BD%9C%E7%9B%AE%E9%8C%84), which is the location where the current terminal or window is, and is also where some commands operate.

For example, you can use `cd lee` to switch to the `lee` folder under the current directory. At this point, running `git clone` will clone the `blog` repository into the `lee` folder.

### Set username and email

```bash
git config --global user.name "username" # Set username
git config --global user.email useremail@qq.com # Set email
```

### Checkout branch

```bash
git branch # View current branches
git checkout branch name # Checkout branch
```

### Clone Repository

```bash
git clone repository_url
```

```bash
git clone https://github.com/Leetfs/blog
```

Example: The URL of this repository is <https://github.com/Leetfs/blog>

```bash
git clone https://github.com/Leetfs/blog ./lee-blog
```

By default, the cloned repository is placed in the current working directory, and the folder name defaults to the repository name.This command means placing the Git-cloned repository into the 'lee-blog' folder in this directory.

> Tips: A path starting with / means starting from the root directory, for example, /lee means 'lee' under the root directory, and ./lee means 'lee' under the current working directory.

### Remote repository

```bash
git remote add custom-remote-repo-name https://github.com/example/source.git # Add a remote repository
git fetch remote-repo-name # Pull the remote repository to local
git branch -a # List all branches
git checkout -b new-branch-name remote-repo-name/remote-branch-name # Check out a new local branch based on the remote branch
git switch feature # Check out a new local branch based on the remote branch (simplified operation)
```

### cherry-pick

Using `git cherry-pick`, you can select one or more commits from other branches/repositories, "copy" these commits to the current branch, and create new commits.

```bash
git checkout target-branch
git cherry-pick <start-hash>^..<end-hash>
git cherry-pick --skip # Skip the current conflicting commit
git cherry-pick --abort # Abort cherry-pick (roll back to the previous state)
```

### Stash / Push / Pull

A common workflow:

```bash
git pull # Pull the latest version
git add . # Stage all files in the folder
git commit -m "Put the commit message here, briefly describe what you changed, language is not limited. (Required)" # Commit staged changes
git push # Push to remote
```

Not finished yet, to be continued.
