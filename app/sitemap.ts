import type { MetadataRoute } from "next";
import blogIndex from "./generated/blog-index.json";
import { absoluteUrl } from "./seo";

export const dynamic = "force-static";

type IndexedArticle = (typeof blogIndex.articles)[number];

function languageAlternates(article: IndexedArticle) {
  const translations = blogIndex.articles.filter((item) => item.canonicalSlug === article.canonicalSlug);
  const languages = Object.fromEntries(translations.map((item) => [item.language, absoluteUrl(item.href)]));
  const chinese = translations.find((item) => item.language === "zh");
  if (chinese) languages["x-default"] = absoluteUrl(chinese.href);
  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const newestUpdate = blogIndex.articles[0]?.updatedAt;
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: newestUpdate, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/blog"), lastModified: newestUpdate, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/resume"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/friends"), changeFrequency: "monthly", priority: 0.6 },
  ];
  const articles: MetadataRoute.Sitemap = blogIndex.articles.map((article) => ({
    url: absoluteUrl(article.href),
    lastModified: article.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
    alternates: { languages: languageAlternates(article) },
  }));
  return [...staticPages, ...articles];
}
