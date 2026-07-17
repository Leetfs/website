---
title: Vitepress カスタムフォント
author: Lee
---

## 方法

フォントファイルを「pubilc」または「assets」フォルダに入れます。

「.vitepress/theme/style.css」を開き、末尾に次の内容を追加します：

```css
@font-face {
  font-family: 'フォント名';
  src: url('フォントファイルパス') format('truetype');
}

:root {
--vp-font-family-base: "フォント名";/* 他のテキスト用フォント */
--vp-font-family-mono: "フォント名";/* コードブロック用フォント */
}
```
