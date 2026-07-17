---
title: Vitepress Navbar Font Switching
author: Lee
---

## Principle of Implementation

Define a CSS variable and update the CSS variable when the navbar button is clicked

## Add Button

```ts
// docs/.vitepress/config.ts
// nav ...
{
    text: "Switch Font",
    items: [
      {
        text: "LXGW WenKai",
        link: "#", // Since no jump is needed, we use an empty link
      },
      {
        text: "LXGW Neo XiHei",
        link: "#",
      },
    ],
  },

```

## Import Fonts in CSS

```css
@font-face {
  font-family: 'LXGW WenKai';
  src: url('/LXGWWenKai-Regular.ttf') format('truetype');
}
```

## Introduce CSS Variables in CSS

Since the initial value of `--main-font` is empty before being assigned, we can use fallback font options as the `default font`

```css
:root {
/* var(--main-font, 'Fallback Font') */
--vp-font-family-base: var(--main-font, 'LXGW WenKai');/* Text font */
--vp-font-family-mono: "LXGW WenKai Mono";/* Code font */
}
```

## Listen to Button and Pass Font Name to CSS Variable

Here we create a new JS script to listen for button clicks and update the CSS variable

```js
// docs/.vitepress/theme/fontSwitcher.js
export const fontMap = {
  'LXGW WenKai': "'LXGW WenKai', serif", // 'Button Name':'Font Name', Fallback font (optional)
  'LXGW Neo XiHei': "'LXGW Neo XiHei', serif",
  };

  // Font switching function
  export const switchFont = (font) => {
    document.documentElement.style.setProperty('--main-font', fontMap[font]);
  };

  // Add global font switching event listener
  export const addFontSwitchListener = () => {
    // Normally, in Vitepress, dropdown content is wrapped in a span tag, please replace with ('.items span'), in this site, dropdowns are wrapped in a tag so use a
    const fontSwitchItems = document.querySelectorAll('.items a'); // Select all 'a' tags in navbar items
    // The following log is for debugging, if not effective you can uncomment the code below
    // console.log(`Found ${fontSwitchItems.length} font switching items`);
    fontSwitchItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target;
        const selectedFont = target.innerText; // Get the clicked font name
        // console.log(`${selectedFont}`);
        switchFont(selectedFont); // Switch font
      });
    });
};
```

> The above is an incorrect example. In Vitepress mobile view, the collapsed navbar is by default in a folded state. Only when the user expands it, the relevant resources are loaded; but the listener is created before this event, which leads to it not being able to listen successfully.

### Correct Example

```ts
export const fontMap = {
  // Font mapping table
  'LXGW WenKai': 'LXGW WenKai',
  'LXGW WenKai Mono': 'LXGW WenKai Mono',
  'LXGW Neo XiHei': 'LXGW Neo XiHei',
  'NeoXiHei Code': 'NeoXiHei Code',
  'Default Font': 'system-ui',
  'Sarasa UI SC': 'Sarasa UI SC',
  'Source Han Serif CN': 'Source Han Serif CN',
  'Sans': 'sans',
  'Serif': 'serif',
};

// Font switching function
export const switchFont = (font) => {
  document.documentElement.style.setProperty('--main-font', fontMap[font]);
};

// Add global font switching event listener
export const addFontSwitchListener = () => {
  // Select hamburger menu
  const hamburger = document.querySelector('.VPNavBarHamburger');
  const fontSwitchItems = document.querySelectorAll('.items a'); // Select all 'a' tags in navbar items
      // console.log(`Found ${fontSwitchItems.length} font switching items`);

      fontSwitchItems.forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const target = e.target;
          const selectedFont = target.innerText; // Get the clicked font name
          // console.log(`${selectedFont}`);
          switchFont(selectedFont); // Switch font
        });
      });

  // Add hamburger menu event listener
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      // Add font switching event listener when hamburger menu opens
      const fontSwitchItems = document.querySelectorAll('.items a'); // Select all 'a' tags in navbar items
      // console.log(`Found ${fontSwitchItems.length} font switching items`);

      fontSwitchItems.forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const target = e.target;
          const selectedFont = target.innerText; // Get the clicked font name
          // console.log(`${selectedFont}`);
          switchFont(selectedFont); // Switch font
        });
      });
    });
  }
};

```

## Import Script in index.ts/index.js

```ts
// docs/.vitepress/theme/index.ts
// https://vitepress.dev/guide/custom-theme
import PtjsTheme from '@project-trans/vitepress-theme-project-trans/theme'
import { onMounted } from 'vue'
import { addFontSwitchListener } from './fontSwitcher' // Import script

import 'uno.css'
import './style.css'

export default {
  extends: PtjsTheme, // This is my imported custom theme
  setup() {
    onMounted(() => {
      addFontSwitchListener(); // Add font switching event listener
    });
  },
}
```

## Conclusion

If it does not work, use the console to check whether the css file access path is correct, whether the script runs properly, and whether the button content is correctly obtained (see comments).
