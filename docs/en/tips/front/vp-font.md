---
title: Vitepress Custom Font
author: Lee
---

## Method

Place the font file in the `public` or `assets` folder.

Edit `.vitepress/theme/style.css` and add the following at the end:

```css
@font-face {
  font-family: 'FontName';
  src: url('PathToFontFile') format('truetype');
}

:root {
--vp-font-family-base: "FontName";/* Other text font */
--vp-font-family-mono: "FontName";/* Code block font */
}
```
