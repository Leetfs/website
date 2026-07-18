---
title: Vitepress カスタムフォント
author: リー
---

## 手順

フォントファイルを `pubilc` または `assets` フォルダに入れます。

`.vitepress/theme/style.css` を編集し、末尾に追加します：

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
