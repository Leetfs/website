---
title: Jenkins 允许加载内联 css 样式
author: Lee
---

## Groovy Script

Jenkins 安全策略:

- No JavaScript allowed at all
- No plugins (object/embed) allowed
- No inline CSS, or CSS from other sites allowed
- No images from other sites allowed
- No frames allowed
- No web fonts allowed
- No XHR/AJAX allowed
- etc.

默认仅放行服务器内部资源，放行内联样式可在 Manage Jenkins -> Script console 执行以下代码，也可使用流水线 + Groovy plugin 插件在流程内执行。

```Groovy
System.setProperty("hudson.model.DirectoryBrowserSupport.CSP", "sandbox allow-same-origin; default-src 'self'; style-src 'self' 'unsafe-inline';")
```

更多细节请查阅[官方文档](https://www.jenkins.io/doc/book/security/configuring-content-security-policy/)
