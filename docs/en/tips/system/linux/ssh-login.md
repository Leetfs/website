---
title: Use SSH Key to Log In to the Server and Disable Password Login
author: Lee
---

## Configure SSH Key Login

- Generate a key pair using the command `ssh-keygen` or use an existing key pair
- Copy the corresponding public key to the `root/.ssh/authorized_keys` file.

## Disable password login

Edit the /etc/ssh/sshd_config file and modify the following parameters:

```text
PubkeyAuthentication yes
PasswordAuthentication no
```

## Restart the SSH Service

```bash
sudo systemctl restart sshd
```

If it does not take effect, delete all files in `etc/ssh/sshd_config.d`.
