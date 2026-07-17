import type { Metadata } from "next";
import blogIndex from "../generated/blog-index.json";
import StudioBlogArchive from "../_studio/components/studio-blog-archive";
import StudioFooter from "../_studio/components/studio-footer";
import StudioHeader from "../_studio/components/studio-header";
import styles from "../_studio/content.module.css";

export const metadata: Metadata = {
  title: "博客 — Lee",
  description: "Linux、RISC-V、LLVM、服务器、Web、VRChat，以及平时遇到的问题和解决办法。",
};

export default function BlogPage() {
  const languages = new Set(blogIndex.articles.map((article) => article.language));

  return (
    <main className={`${styles.page} ${styles.innerPage}`}>
      <StudioHeader compact />
      <header className={styles.indexHero}>
        <p className={styles.index}>BLOG / NOTES</p>
        <h1>平时折腾过的东西，<span>顺手记在这里。</span></h1>
        <div>
          <p>
            大多是 Linux、RISC-V、LLVM、服务器和 VRChat 的配置与排错。
            文章不会刻意写长，能把问题说清、下次搜得到就够了。
          </p>
          <dl>
            <div><dt>文档</dt><dd>{blogIndex.total}</dd></div>
            <div><dt>语言</dt><dd>{languages.size}</dd></div>
            <div><dt>更新方式</dt><dd>手动整理</dd></div>
          </dl>
        </div>
      </header>
      <StudioBlogArchive articles={blogIndex.articles} />
      <StudioFooter />
    </main>
  );
}
