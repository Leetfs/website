---
title: Fix GPG signature errors in terminal environments
author: Lee
---

## Troubleshooting

When connecting to the server via terminal and using the GPG key within Yubikey to sign Git commits, an error appears. Brief troubleshooting steps:

![](/tips/system/linux/pubilc/gpg-sign-img/gpg-sign-1.png)

Verify if there is a valid private key:

```bash
gpg --list-secret-keys --keyid-format LONG
```

![](/tips/system/linux/pubilc/gpg-sign-img/gpg-sign-2.png)

Test whether the smart card can be read correctly:

```bash
gpg --card-status
```

![](/tips/system/linux/pubilc/gpg-sign-img/gpg-sign-3.png)

Test signing directly with GPG:

```bash
echo \"test\" | gpg --clearsign
```

Receive the output:

```bash
-----BEGIN PGP SIGNED MESSAGE-----\nHash: SHA256\n\ntest\ngpg: signing failed: Inappropriate ioctl for device\ngpg: [stdin]: clear-sign failed: Inappropriate ioctl for device
```

Observing the error, it is found that in multi-terminal environments, GPG cannot automatically recognize the current terminal device in use, resulting in the inability to correctly prompt the user for PIN input. Try to fix by configuring the GPG_TTY environment variable:

```bash
export GPG_TTY=$(tty)
```

Retest signing:

![](/tips/system/linux/pubilc/gpg-sign-img/gpg-sign-4.png)

The verification prompt appears successfully, and the issue is resolved.
