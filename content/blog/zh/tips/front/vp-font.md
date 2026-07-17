---
title: Vitepress 自定义字体
author: Lee
---

## 方法

将字体文件放入 `pubilc` 或 `assets` 文件夹。

修改 `.vitepress/theme/style.css`, 在末尾加入：

```css
@font-face {
  font-family: '字体名';
  src: url('字体文件路径') format('truetype');
}

:root {
--vp-font-family-base: "字体名";/* 其他文字字体 */
--vp-font-family-mono: "字体名";/* 代码块字体 */
}
```
