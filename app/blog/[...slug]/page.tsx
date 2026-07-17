import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import blogContent from "../../generated/blog-content.json";
import StudioFooter from "../../_studio/components/studio-footer";
import StudioHeader from "../../_studio/components/studio-header";
import styles from "../../_studio/content.module.css";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

const languageLabels = { zh: "简体中文", en: "English", ja: "日本語" } as const;

function getArticle(slug: string[]) {
  const path = `/${slug.join("/")}`.replace(/\/tips\/front\/vp-fontSwitch$/, "/tips/front/vp-font-switch");
  return blogContent.articles.find((article) => article.slug === path);
}

export function generateStaticParams() {
  return [...blogContent.articles.map((article) => ({
    slug: article.slug.split("/").filter(Boolean),
  })), { slug: ["tips", "front", "vp-fontSwitch"] }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = getArticle((await params).slug);
  if (!article) return {};
  return { title: `${article.title} — Lee`, description: article.description };
}

export default async function ArticlePage({ params }: PageProps) {
  const article = getArticle((await params).slug);
  if (!article) notFound();

  const sameLanguage = blogContent.articles.filter((item) => item.language === article.language);
  const currentIndex = sameLanguage.findIndex((item) => item.slug === article.slug);
  const newer = currentIndex > 0 ? sameLanguage[currentIndex - 1] : null;
  const older = currentIndex < sameLanguage.length - 1 ? sameLanguage[currentIndex + 1] : null;
  const language = languageLabels[article.language as keyof typeof languageLabels];

  return (
    <main className={`${styles.page} ${styles.innerPage}`}>
      <StudioHeader compact />

      <header className={styles.articleHero}>
        <div className={styles.articleKicker}>
          <span>{article.number}</span>
          <span>{article.category}</span>
        </div>
        <div className={styles.articleTitle}>
          <p>{article.section} / {language}</p>
          <h1>{article.title}</h1>
          <p>{article.description}</p>
        </div>
        <dl className={styles.articleFacts}>
          <div><dt>更新</dt><dd>{article.displayDate}</dd></div>
          <div><dt>阅读</dt><dd>约 {article.readingMinutes} 分钟</dd></div>
          <div><dt>语言</dt><dd>{language}</dd></div>
        </dl>
      </header>

      <div className={styles.readingLayout}>
        <aside className={styles.articleToc}>
          <div>
            <p>本文目录</p>
            {article.toc.length ? (
              <nav aria-label="文章目录">
                {article.toc.map((item) => (
                  <a
                    key={`${item.id}-${item.depth}`}
                    className={item.depth > 2 ? styles.deepToc : ""}
                    href={`#${item.id}`}
                  >
                    {item.title}
                  </a>
                ))}
              </nav>
            ) : <span>这篇很短，没有目录</span>}
          </div>
          <Link href="/blog">← 返回博客</Link>
        </aside>

        <article
          className={styles.prose}
          id="article-content"
          lang={article.language === "zh" ? "zh-CN" : article.language}
          dangerouslySetInnerHTML={{ __html: article.html }}
        />
      </div>

      <nav className={styles.articlePagination} aria-label="相邻文章">
        {newer ? (
          <Link href={newer.href}>
            <span>← 更新一篇</span><strong>{newer.title}</strong>
          </Link>
        ) : <span />}
        {older ? (
          <Link href={older.href}>
            <span>更早一篇 →</span><strong>{older.title}</strong>
          </Link>
        ) : <span />}
      </nav>

      <StudioFooter />
    </main>
  );
}
