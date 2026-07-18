import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "../../_seo/json-ld";
import StudioFooter from "../../_studio/components/studio-footer";
import StudioHeader from "../../_studio/components/studio-header";
import styles from "../../_studio/content.module.css";
import blogContent from "../../generated/blog-content.json";
import {
  absoluteUrl,
  canonicalPath,
  SITE_NAME,
  SITE_URL,
  SOCIAL_IMAGE,
} from "../../seo";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

const languageLabels = { zh: "简体中文", en: "English", ja: "日本語" } as const;
const openGraphLocales = { zh: "zh_CN", en: "en_US", ja: "ja_JP" } as const;

function getArticle(slug: string[]) {
  const path = `/${slug.join("/")}`.replace(/\/tips\/front\/vp-fontSwitch$/, "/tips/front/vp-font-switch");
  return blogContent.articles.find((article) => article.slug === path);
}

function languageAlternates(canonicalSlug: string) {
  const translations = blogContent.articles.filter((article) => article.canonicalSlug === canonicalSlug);
  const languages = Object.fromEntries(
    translations.map((article) => [article.language, canonicalPath(article.href)]),
  );
  const chinese = translations.find((article) => article.language === "zh");
  if (chinese) languages["x-default"] = canonicalPath(chinese.href);
  return languages;
}

export function generateStaticParams() {
  return [
    ...blogContent.articles.map((article) => ({
      slug: article.slug.split("/").filter(Boolean),
    })),
    { slug: ["tips", "front", "vp-fontSwitch"] },
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = getArticle((await params).slug);
  if (!article) return {};

  const description = article.description;
  const canonical = canonicalPath(article.href);
  const socialTitle = `${article.title} — ${SITE_NAME}`;
  const locale = openGraphLocales[article.language as keyof typeof openGraphLocales];
  const alternateLocale = Object.entries(openGraphLocales)
    .filter(([language]) => language !== article.language)
    .map(([, value]) => value);

  return {
    title: article.title,
    description,
    alternates: {
      canonical,
      languages: languageAlternates(article.canonicalSlug),
    },
    openGraph: {
      type: "article",
      url: canonical,
      siteName: SITE_NAME,
      title: socialTitle,
      description,
      locale,
      alternateLocale,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: ["Lee"],
      tags: [article.category, ...article.topics],
      images: [{ url: SOCIAL_IMAGE, width: 1729, height: 910, alt: socialTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      creator: "@leetfs1",
      images: [SOCIAL_IMAGE],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const article = getArticle((await params).slug);
  if (!article) notFound();

  const sameLanguage = blogContent.articles.filter((item) => item.language === article.language);
  const currentIndex = sameLanguage.findIndex((item) => item.slug === article.slug);
  const newer = currentIndex > 0 ? sameLanguage[currentIndex - 1] : null;
  const older = currentIndex < sameLanguage.length - 1 ? sameLanguage[currentIndex + 1] : null;
  const language = languageLabels[article.language as keyof typeof languageLabels];
  const pageUrl = absoluteUrl(article.href);
  const articleGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${pageUrl}#article`,
        mainEntityOfPage: pageUrl,
        headline: article.title,
        description: article.description,
        image: absoluteUrl(SOCIAL_IMAGE),
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
        inLanguage: article.language === "zh" ? "zh-CN" : article.language,
        author: { "@type": "Person", "@id": `${SITE_URL}/#person`, name: "Lee", url: SITE_URL },
        publisher: { "@type": "Person", "@id": `${SITE_URL}/#person`, name: "Lee", url: SITE_URL },
        isPartOf: { "@id": `${absoluteUrl("/blog")}#blog` },
        keywords: [article.category, ...article.topics].join(", "),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Website", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "博客", item: absoluteUrl("/blog") },
          { "@type": "ListItem", position: 3, name: article.title, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <main className={`${styles.page} ${styles.innerPage}`}>
      <JsonLd data={articleGraph} />
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
