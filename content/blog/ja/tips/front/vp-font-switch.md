---
title: Vitepress ナビゲーションバーのフォント切り替え
author: Lee
---

## 実現原理

CSS変数を定義し、ナビゲーションバーボタンがクリックされた時にCSS変数を更新する

## ボタンの追加

```ts
// docs/.vitepress/config.ts
// nav ...
{
    text: "フォント切替",
    items: [
      {
        text: "霞鶩文楷",
        link: "#", // リンク遷移不要なので空リンクを使用
      },
      {
        text: "霞鶩新晰黒",
        link: "#",
      },
    ],
  },

```

## CSSでフォントをインポートする

```css
@font-face {
  font-family: '霞鶩文楷';
  src: url('/LXGWWenKai-Regular.ttf') format('truetype');
}
```

## CSSにCSS変数を導入する

`--main-font` が値を割り当てられる前は初期値が空なので、代替フォントオプションを「デフォルトフォント」として利用できます

```css
:root {
/* var(--main-font, '代替フォント') */
--vp-font-family-base: var(--main-font, '霞鶩文楷');/* テキストフォント */
--vp-font-family-mono: "霞鶩文楷-等幅";/* コードフォント */
}
```

## ボタンを監視し、フォント名をCSS変数に渡す

ここでは新しくjsスクリプトを作成し、ボタンの監視とCSS変数の更新を行います

```js
// docs/.vitepress/theme/fontSwitcher.js
export const fontMap = {
  '霞鶩文楷': "'霞鶩文楷', serif", // 'ボタン名':'フォント名',代替フォント(任意)
  '霞鶩新晰黒': "'霞鶩新晰黒', serif",
  };

  // フォント切替関数
  export const switchFont = (font) => {
    document.documentElement.style.setProperty('--main-font', fontMap[font]);
  };

  // 全体フォント切替イベントリスナーを追加
  export const addFontSwitchListener = () => {
    // 通常Vitepressのドロップダウンメニュー内容はspanタグでラップされているため、('.items span') に置き換えてください。当サイトはaタグなのでaを使用
    const fontSwitchItems = document.querySelectorAll('.items a'); // 全てのナビゲーションaタグを取得
    // このログはデバッグ用。うまくいかない場合は下記のコメントを外してください
    // console.log(`見つかったフォント切替項目 ${fontSwitchItems.length} 件`);
    fontSwitchItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target;
        const selectedFont = target.innerText; // クリックしたフォント名を取得
        // console.log(`${selectedFont}`);
        switchFont(selectedFont); // フォント切替
      });
    });
};
```

> 上記は誤った例で、Vitepressのモバイルビューでは折りたたみナビゲーションがデフォルトで折りたたみ状態となっており、ユーザーがナビゲーションを展開した時に初めて関連リソースが読み込まれるため、リスナーがこの前に作成されてしまい正常に監視できません。

### 正しい例

```ts
export const fontMap = {
  // フォントマッピングテーブル
  '霞鶩文楷': 'LXGW WenKai',
  '霞鶩文楷 Mono': 'LXGW WenKai Mono',
  '霞鶩新晰黒': 'LXGW Neo XiHei',
  '新晰黒 Code': 'NeoXiHei Code',
  'デフォルトフォント': 'system-ui',
  '更紗黒体': 'Sarasa UI SC',
  '思源宋体': 'Source Han Serif CN',
  '黒体': 'sans',
  '宋体': 'serif',
};

// フォント切替関数
export const switchFont = (font) => {
  document.documentElement.style.setProperty('--main-font', fontMap[font]);
};

// 全体フォント切替イベントリスナーを追加
export const addFontSwitchListener = () => {
  // ハンバーガーメニューを選択
  const hamburger = document.querySelector('.VPNavBarHamburger');
  const fontSwitchItems = document.querySelectorAll('.items a'); // 全てのナビゲーションaタグを取得
      // console.log(`見つかったフォント切替項目 ${fontSwitchItems.length} 件`);

      fontSwitchItems.forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const target = e.target;
          const selectedFont = target.innerText; // クリックしたフォント名を取得
          // console.log(`${selectedFont}`);
          switchFont(selectedFont); // フォント切替
        });
      });

  // ハンバーガーメニューのイベントリスナーを追加
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      // ハンバーガーメニュー展開時にフォント切替イベントリスナーを追加
      const fontSwitchItems = document.querySelectorAll('.items a'); // 全てのナビゲーションaタグを取得
      // console.log(`見つかったフォント切替項目 ${fontSwitchItems.length} 件`);

      fontSwitchItems.forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const target = e.target;
          const selectedFont = target.innerText; // クリックしたフォント名を取得
          // console.log(`${selectedFont}`);
          switchFont(selectedFont); // フォント切替
        });
      });
    });
  }
};

```

## index.ts/index.jsでスクリプトをインポートする

```ts
// docs/.vitepress/theme/index.ts
// https://vitepress.dev/guide/custom-theme
import PtjsTheme from '@project-trans/vitepress-theme-project-trans/theme'
import { onMounted } from 'vue'
import { addFontSwitchListener } from './fontSwitcher' // スクリプトをインポート

import 'uno.css'
import './style.css'

export default {
  extends: PtjsTheme, // こちらはカスタムテーマをインポート
  setup() {
    onMounted(() => {
      addFontSwitchListener(); // フォント切替イベントリスナー追加
    });
  },
}
```

## 結び

うまく動作しない場合は、コンソールでcssファイルのパスが正しいか、スクリプトが正常に実行されているか、ボタン内容を正しく取得できているか（コメント参照）を必ずご確認ください。
