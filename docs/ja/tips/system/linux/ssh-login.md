---
title: 使用 ssh 密钥登陆服务器并禁用密码登陆
author: Lee
---

## 配置 ssh 密钥登陆

- 使用指令 `ssh-keygen` 生成密钥，或使用已有密钥
- 将对应公钥拷贝到 `root/.ssh/authorized_keys` 文件内。

## 禁用密码登陆

编辑 /etc/ssh/sshd_config 文件，修改以下参数：

```text
PubkeyAuthentication yes
PasswordAuthentication no
```

## 重启 ssh 服务

```bash
sudo systemctl restart sshd
```

如不生效，删除 `etc/ssh/sshd_config.d` 内的所有文件。
