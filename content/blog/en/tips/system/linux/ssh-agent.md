---
title: ssh agent forwarding
author: Lee
---

## Use Cases

During development, to use SSH keys more securely on remote servers, it is recommended to invoke local keys through SSH agent forwarding, instead of storing the keys directly on the server.This can effectively reduce the risk of key leakage and improve overall security.

## Configuration

### Verify Local Setup

First, ensure that your local ssh is running correctly. You can use the `ssh-add -l` command to list all ssh keys, or use `ssh -T` to test if access works properly.

![](/tips/system/linux/pubilc/ssh-agent-1.png)

### Set up ssh agent forwarding

Open the `User folder/.ssh/config` file and add `ForwardAgent yes` under the server configuration where you want to enable ssh agent forwarding.

Example:

```text{4}
Host test-server
  HostName your-server-address-here
  User root
  ForwardAgent yes
```

You can also enable this globally:

```text
Host *
  ForwardAgent yes
```

After setup, you can run `ssh-add -l` on the server to list all ssh keys. If it does not work, check that the `AllowAgentForwarding` option in `etc/ssh/sshd_config` on the server is correctly set to `yes`.

### Security Notice

:::warning
The server cannot access the keys directly, but once the connection is established, it can use the keys as if it were you. Only add trusted servers or use solutions like 1Password agent requiring secondary authentication to ensure security.
:::
