"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "../content.module.css";

type Article = {
  number: string;
  category: string;
  section: string;
  language: string;
  title: string;
  description: string;
  href: string;
  displayDate: string;
  readingMinutes: number;
};

const languageLabels = { zh: "中文", en: "English", ja: "日本語" } as const;
type Locale = keyof typeof languageLabels;
const languageStorageKey = "lee-studio-language";

function detectBrowserLocale(): Locale {
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const value of languages) {
    const language = value.toLocaleLowerCase();
    if (language.startsWith("zh")) return "zh";
    if (language.startsWith("ja")) return "ja";
  }
  return "en";
}

export default function StudioBlogArchive({ articles }: { articles: Article[] }) {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<Locale>("zh");
  const [topic, setTopic] = useState("ALL");

  useEffect(() => {
    const stored = window.localStorage.getItem(languageStorageKey);
    const nextLanguage = stored === "zh" || stored === "en" || stored === "ja" ? stored : detectBrowserLocale();
    queueMicrotask(() => setLanguage(nextLanguage));
  }, []);

  const chooseLanguage = (nextLanguage: Locale) => {
    setLanguage(nextLanguage);
    window.localStorage.setItem(languageStorageKey, nextLanguage);
  };

  const topics = useMemo(
    () => ["ALL", ...Array.from(new Set(articles.map((article) => article.category.split(" / ")[0])))],
    [articles],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return articles.filter((article) => {
      const matchesLanguage = article.language === language;
      const matchesTopic = topic === "ALL" || article.category.startsWith(topic);
      const matchesQuery = !needle || `${article.title} ${article.description} ${article.category}`.toLocaleLowerCase().includes(needle);
      return matchesLanguage && matchesTopic && matchesQuery;
    });
  }, [articles, language, query, topic]);

  return (
    <div className={styles.archiveLayout}>
      <aside className={styles.archiveFilters} aria-label="文章筛选">
        <label className={styles.searchField}>
          <span>搜索</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="标题、摘要或主题"
          />
        </label>

        <div className={styles.filterGroup}>
          <p>语言</p>
          {Object.entries(languageLabels).map(([value, label]) => (
            <button
              type="button"
              className={language === value ? styles.activeFilter : ""}
              onClick={() => chooseLanguage(value as Locale)}
              key={value}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={styles.filterGroup}>
          <p>分类</p>
          {topics.map((value) => (
            <button
              type="button"
              className={topic === value ? styles.activeFilter : ""}
              onClick={() => setTopic(value)}
              key={value}
            >
              {value}
            </button>
          ))}
        </div>
      </aside>

      <section className={styles.archiveResults} aria-live="polite">
        <div className={styles.resultCount}>
          <span>{String(filtered.length).padStart(3, "0")} 篇</span>
          <span>按更新时间倒序</span>
        </div>
        {filtered.length ? filtered.map((article) => (
          <Link className={styles.archiveArticle} href={article.href} key={article.href}>
            <span className={styles.archiveNumber}>{article.number}</span>
            <div>
              <p>{article.category} / {article.language.toUpperCase()}</p>
              <h2>{article.title}</h2>
              <span>{article.description}</span>
            </div>
            <div className={styles.archiveMeta}>
              <time>{article.displayDate}</time>
              <span>约 {article.readingMinutes} 分钟</span>
              <b aria-hidden="true">↗</b>
            </div>
          </Link>
        )) : (
          <div className={styles.emptyState}>
            <p>没有找到匹配的文章。</p>
            <button type="button" onClick={() => { setQuery(""); setTopic("ALL"); }}>
              清除筛选
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
