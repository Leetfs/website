---
layout: page
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
    avatar: '/friendly/lumi.PNG',
    name: 'CatRoll',
    title: 'CatRoll\'s Cattery',
    links: [
      { icon: 'devbox', link: 'https://github.com/lumigj' },
    ]
  },
  {
    avatar: '/friendly/nhui.jpg',
    name: '玲雨兰夜',
    title: 'Nya!',
    links: [
      { icon: 'devbox', link: 'http://nhui.top/' },
    ]
  },
  {
    avatar: 'https://avatars.githubusercontent.com/u/85744569',
    name: '香菜',
    title: "Xiangcai's blog",
    links: [
      { icon: 'devbox', link: 'https://mdzz.pro/' },
    ]
  },
  {
    avatar: 'https://www.iacg.moe/upload/cat.png',
    name: 'DokiDoki·大黄猫',
    title: 'Yellow Cat Grocery',
    links: [
      { icon: 'devbox', link: 'https://www.iacg.moe/' },
    ]
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
