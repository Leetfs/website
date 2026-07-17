"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "../content.module.css";

const navItems = [
  { href: "/", number: "01", icon: "◇", label: "主页", type: "Scene" },
  { href: "/blog", number: "02", icon: "▤", label: "博客", type: "Content" },
  { href: "/resume", number: "03", icon: "▦", label: "个人简介", type: "Asset" },
  { href: "/friends", number: "04", icon: "◯", label: "友链", type: "Asset" },
] as const;

const editorMenus = [
  { label: "文件", items: [["打开主页", "/"], ["打开博客", "/blog"]] },
  { label: "编辑", items: [["个人简介", "/resume"], ["友链", "/friends"]] },
  { label: "资源", items: [["全部文章", "/blog"], ["GitHub", "https://github.com/Leetfs/website"]] },
  { label: "窗口", items: [["3D 场景", "/"], ["项目资源", "/#project"]] },
] as const;

export default function StudioHeader({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  useEffect(() => {
    const close = () => setActiveMenu(null);
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, []);

  const current = navItems.find((item) => item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)) ?? navItems[0];

  return (
    <header className={`${styles.header} ${compact ? styles.compactHeader : ""}`}>
      <div className={styles.innerMenuBar}>
        <Link className={styles.innerUnityBrand} href="/">LEE<span>UNITY</span></Link>
        <nav className={styles.innerMenuNav} aria-label="编辑器菜单">
          {editorMenus.map((menu, index) => <div key={menu.label} onPointerDown={(event) => event.stopPropagation()}>
            <button className={activeMenu === index ? styles.innerMenuActive : ""} onClick={() => setActiveMenu((value) => value === index ? null : index)}>{menu.label}</button>
            {activeMenu === index && <div>{menu.items.map(([label, href]) => <Link href={href} key={label}>{label}</Link>)}</div>}
          </div>)}
        </nav>
        <span className={styles.editorRoute}>Assets / Content / {current.label}.asset</span>
      </div>

      <div className={styles.railHead}>
        <strong>层级</strong>
        <Link href="/#project" aria-label="打开项目资源">＋</Link>
      </div>
      <div className={styles.innerSceneRoot}>⌄　Lee / Homepage</div>
      <nav className={styles.nav} aria-label="站点页面">
        {navItems.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return <Link className={active ? styles.activeInnerNode : ""} href={item.href} aria-current={active ? "page" : undefined} key={item.href}>
            <i>{item.icon}</i><span>{item.number}</span><strong>{item.label}</strong><small>{item.type}</small>
          </Link>;
        })}
      </nav>
      <div className={styles.railFoot}>
        <span>INSPECTOR</span>
        <dl><div><dt>Type</dt><dd>{current.type}</dd></div><div><dt>Name</dt><dd>{current.label}</dd></div></dl>
        <a href="mailto:lee@mtftm.com">lee@mtftm.com ↗</a>
        <a href="https://github.com/Leetfs/website" target="_blank" rel="noreferrer">GitHub ↗</a>
      </div>
    </header>
  );
}
