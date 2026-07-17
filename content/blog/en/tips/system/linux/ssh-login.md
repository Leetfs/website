---
title: Log in to the server using SSH keys and disable password login
author: Lee
---

## Configure SSH key login

- Generate a key pair using the command `ssh-keygen` or use an existing key pair
- Copy the corresponding public key to the `root/.ssh/authorized_keys` file.

## Disable password login

Edit the /etc/ssh/sshd_config file and modify the following parameters:

```text
PubkeyAuthentication yes
PasswordAuthentication no
```

## Restart the SSH service

```bash
sudo systemctl restart sshd
```

If it does not take effect, delete all files in `etc/ssh/sshd_config.d`.
