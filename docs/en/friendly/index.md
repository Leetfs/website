---
layout: page
title: Friends Links
---

<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers
} from 'vitepress/theme'

const title = 'Friends Links'
const lead = 'Here are my friends~(ฅ´ω`ฅ)'

// icon: <https://simpleicons.org/>
const members = [
  {
    avatar: "/friendly/lumi.PNG",
    name: "猫卷",
    title: "CatRoll Cattery",
    links: [{ icon: "github", link: "https://github.com/lumigj", ariaLabel: "猫卷" }],
  },
  {
    avatar: "/friendly/nhui.jpg",
    name: "玲雨兰夜",
    title: "Welcome to Lingyu Lanye's personal site.",
    links: [{ icon: "devbox", link: "http://nhui.top/", ariaLabel: "玲雨兰夜" }],
  },
  {
    avatar: "https://avatars.githubusercontent.com/u/85744569",
    name: "香菜",
    title: "Technology, life, and personal notes.",
    links: [{ icon: "devbox", link: "https://mdzz.pro/", ariaLabel: "香菜" }],
  },
  {
    avatar: "https://www.iacg.moe/upload/cat.png",
    name: "DokiDoki·大黄猫",
    title: "A continuously updated web variety store.",
    links: [{ icon: "devbox", link: "https://www.iacg.moe/", ariaLabel: "DokiDoki·大黄猫" }],
  },
  {
    avatar: "/friendly/catherina.png",
    name: "Catherina",
    title: "A friend and a great colleague.",
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
    width: 185px;          /* Visible area size */
    height: 140px;
    overflow: hidden;
    z-index: 9999;
    border-radius: 8px;
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .promo-zoom {
    width: 310px;          /* Original content width */
    height: 250px;         /* Original content height */
    transform: scale(0.6); /* Display scale */
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

<div class="promo-wrapper" id="promoBox"><button class="promo-close" onclick="document.getElementById('promoBox').style.display='none'">×</button>  <div class="promo-zoom">
    <iframe src="https://support.nodeget.com/page/promotion?id=Leetfs" scrolling="no"></iframe>
  </div>
</div>
