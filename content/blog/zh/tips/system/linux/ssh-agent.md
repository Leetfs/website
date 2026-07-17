---
title: ssh 代理转发
author: Lee
---

## 使用场景

开发过程中，为了更安全地在远程服务器上使用 SSH 密钥，建议通过 SSH 代理转发调用本地密钥，而不是直接将密钥存储在服务器上。这可以有效避免密钥泄露风险，提高整体安全性。

## 配置

### 验证本地设置

首先应确保本地ssh已正常运行，可使用 `ssh-add -l` 指令查询所有ssh密钥，也可运行 `ssh -T` 测试是否可以正确访问。

![](/tips/system/linux/pubilc/ssh-agent-1.png)

### 设置 ssh agent forwarding

打开 `用户文件夹/.ssh/config` 文件，在你希望启用 ssh 代理转发的服务器配置下添加 `ForwardAgent yes`

例：

```text{4}
Host 测试服务器
  HostName 这里是服务器地址
  User root
  ForwardAgent yes
```

也可使用此方法全局启用：

```text
Host *
  ForwardAgent yes
```

设置完成后可在服务器端执行 `ssh-add -l` 列出所有ssh密钥，如不生效请检查服务器端 `etc/ssh/sshd_config` 文件内的 `AllowAgentForwarding` 选项是否被正确设置为 `yes`。

### 安全提示

::: warning
服务器无法直接访问密钥，但建立连接后可以像你一样使用密钥，请只添加信任的服务器或使用 1password agent 等需二次认证的方案确保安全性。
:::
