---
title: GitHub PR FAQ
author: Lee
---

## Overview

This chapter is for common issues beginners may encounter. If you have any questions, feel free to [contact the author](https://github.com/Leetfs).

## What should I do if there are new commits in the repository before my PR is merged?

If there are no merge conflicts, you can ignore it; if there are merge conflicts, you need to resolve them first.

## After my PR is merged, I want to submit a new PR

Be sure not to commit directly to the original branch, as this may cause merge conflicts.

### Solution 1

You can update the branch to the latest version

(Both buttons are effective. The first one updates to the latest version and discards your local commits, while the second updates to the latest version)
![](/tips/git/github-img/image11.png)

### Solution 2

Create a new branch based on the upstream repository and commit in the new branch

![](/tips/git/github-img/image12.png)
![](/tips/git/github-img/image13.png)

## How to modify after submission

Before the PR is merged, the branch and PR are bound together; just modify the corresponding branch directly.

## How to review a PR

Go into the PR and click on `Files changed`

![](/tips/git/github-img/image14.png)

Click on `Review changes`

![](/tips/git/github-img/image15.png)
