---
title: Jenkins allows loading inline CSS styles
author: Lee
---

## Groovy Script

Jenkins security policy:

- No JavaScript allowed at all
- No plugins (object/embed) allowed
- No inline CSS, or CSS from other sites allowed
- No images from other sites allowed
- No frames allowed
- No web fonts allowed
- No XHR/AJAX allowed
- etc.

By default, only internal server resources are allowed. To allow inline styles, execute the following code in Manage Jenkins -> Script Console, or use Pipeline + Groovy plugin to execute during the process.

```Groovy
System.setProperty("hudson.model.DirectoryBrowserSupport.CSP", "sandbox allow-same-origin; default-src 'self'; style-src 'self' 'unsafe-inline';")
```

For more details, please refer to the [official documentation](https://www.jenkins.io/doc/book/security/configuring-content-security-policy/)
