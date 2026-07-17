import Link from "next/link";
import styles from "../content.module.css";

export default function StudioFooter() {
  return (
    <footer className={styles.innerFooter}>
      <p>LEE / LINUX / RISC-V / WEB</p>
      <nav aria-label="页脚导航">
        <Link href="/blog">博客</Link>
        <Link href="/resume">个人简介</Link>
        <a href="https://github.com/Leetfs" target="_blank" rel="noreferrer">GitHub</a>
        <a href="mailto:lee@mtftm.com">Email</a>
      </nav>
      <span>© 2026 LEE</span>
    </footer>
  );
}
