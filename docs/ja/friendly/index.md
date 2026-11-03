---
layout: page
title: 友達リンク
---

<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers
} from 'vitepress/theme'

const title = '友達リンク'
const lead = 'ここは私の友人たちです～(ฅ´ω`ฅ)'

// icon: <https://simpleicons.org/>
const members = [
  {
    avatar: "/friendly/lumi.PNG",
    name: "猫卷",
    title: "優しくて純粋な猫。",
    links: [{ icon: "github", link: "https://github.com/lumigj", ariaLabel: "猫卷" }],
  },
  {
    avatar: "/friendly/nhui.jpg",
    name: "玲雨兰夜",
    title: "玲雨兰夜の個人サイトへようこそ。",
    links: [{ icon: "devbox", link: "http://nhui.top/", ariaLabel: "玲雨兰夜" }],
  },
  {
    avatar: "https://avatars.githubusercontent.com/u/85744569",
    name: "香菜",
    title: "技術、生活、個人の記録。",
    links: [{ icon: "devbox", link: "https://mdzz.pro/", ariaLabel: "香菜" }],
  },
  {
    avatar: "https://www.iacg.moe/upload/cat.png",
    name: "DokiDoki·大黄猫",
    title: "更新を続けるウェブ雑貨店。",
    links: [{ icon: "devbox", link: "https://www.iacg.moe/", ariaLabel: "DokiDoki·大黄猫" }],
  },
  {
    avatar: "/friendly/catherina.png",
    name: "Catherina",
    title: "友人であり、素晴らしい同僚でもあります。",
    links: [{ icon: "devbox", link: "https://catherina.moe/", ariaLabel: "Catherina" }],
  },
]
</script>

<VPTeamPage><span>
    <VPTeamPageTitle>
      <template #title>{{ title }}</template>
      <template #lead>{{ lead }}</template>
    </VPTeamPageTitle>
  </span>
  <VPTeamMembers
    :members="members"
  />
</VPTeamPage>

<style>
  .promo-wrapper {
    position: fixed;
    bottom: 3%;
    right: 2%;
    width: 185px;          /* 表示エリアのサイズ */
    height: 140px;
    overflow: hidden;
    z-index: 9999;
    border-radius: 8px;
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .promo-zoom {
    width: 310px;          /* 元のコンテンツの幅 */
    height: 250px;         /* 元のコンテンツの高さ */
    transform: scale(0.6); /* 表示縮尺 */
    transform-origin: top left;
    pointer-events: auto;
  }

  .promo-zoom iframe {
    width: 100%;
    height: 100%;
    border: none;
  }

  .promo-close {
    position: absolute;
    top: 4px;
    right: 6px;
    width: 20px;
    height: 20px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 14px;
    line-height: 18px;
    cursor: pointer;
    text-align: center;
    z-index: 10000;
  }
</style>

<div class="promo-wrapper" id="promoBox"><button class="promo-close" onclick="document.getElementById('promoBox').style.display='none'">×</button>
  <div class="promo-zoom">
    <iframe src="https://support.nodeget.com/page/promotion?id=Leetfs" scrolling="no"></iframe>
  </div>
</div>
