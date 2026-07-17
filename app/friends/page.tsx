import type { Metadata } from "next";
import Image from "next/image";
import StudioFooter from "../_studio/components/studio-footer";
import StudioHeader from "../_studio/components/studio-header";
import styles from "../_studio/content.module.css";

export const metadata: Metadata = {
  title: "友链 — Lee",
  description: "Lee 的友情链接。这里收录几位朋友的个人网站和主页。",
};

const friends = [
  { name: "猫卷", description: "善良的猫卷，纯洁的猫卷，乖孩子猫卷。", href: "https://github.com/lumigj", host: "github.com/lumigj", avatar: "/friends/lumi.PNG" },
  { name: "玲雨兰夜", description: "诶嘿嘿……欢迎来到玲雨兰夜的个人站点。", href: "http://nhui.top/", host: "nhui.top", avatar: "/friends/nhui.jpg" },
  { name: "香菜", description: "香菜的博客，分享技术、生活和个人记录。", href: "https://mdzz.pro/", host: "mdzz.pro", avatar: "https://avatars.githubusercontent.com/u/85744569" },
  { name: "DokiDoki·大黄猫", description: "黄猫杂货店，一间有趣且持续更新的网络小店。", href: "https://www.iacg.moe/", host: "iacg.moe", avatar: "https://www.iacg.moe/upload/cat.png" },
  { name: "Catherina", description: "是朋友，也是很好的同事", href: "https://catherina.moe/", host: "catherina.moe", avatar: "/friends/catherina.png" },
];

export default function FriendsPage() {
  return (
    <main className={`${styles.page} ${styles.innerPage}`}>
      <StudioHeader compact />
      <header className={styles.friendsHero}>
        <p className={styles.index}>FRIENDS / LINKS</p>
        <h1>友链<span>。</span></h1>
        <div>
          <p>这里是几位朋友的个人站。简介尽量保留他们自己的说法，顺序不分先后。</p>
          <span>{String(friends.length).padStart(2, "0")} 个链接</span>
        </div>
      </header>

      <section className={styles.friendDirectory}>
        <div className={styles.directoryIntro}>
          <p className={styles.index}>01 / LIST</p>
          <h2>朋友们的网站</h2>
          <p>点击会在新标签页打开。</p>
        </div>
        <div className={styles.friendList}>
          {friends.map((friend, index) => (
            <a href={friend.href} target="_blank" rel="noopener noreferrer" key={friend.name}>
              <span className={styles.friendNumber}>F0{index + 1}</span>
              <div className={styles.friendAvatar}>
                <Image
                  src={friend.avatar}
                  alt={`${friend.name} 的头像`}
                  width={160}
                  height={160}
                  unoptimized
                />
              </div>
              <div>
                <p>{friend.host}</p>
                <h2>{friend.name}</h2>
                <span>{friend.description}</span>
              </div>
              <b aria-hidden="true">↗</b>
            </a>
          ))}
        </div>
      </section>

      <section className={styles.friendInvite}>
        <p className={styles.index}>02 / ADD A LINK</p>
        <h2>想交换友链？</h2>
        <p>把网站地址、名称、简介和头像发给我就行。我也会把自己的信息回给你。</p>
        <a href="mailto:lee@mtftm.com?subject=交换友链" target="_blank" rel="noopener noreferrer">交换友链 ↗</a>
      </section>
      <StudioFooter />
    </main>
  );
}
