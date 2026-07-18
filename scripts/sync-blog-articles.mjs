import { execFile } from "node:child_process";
import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { marked } from "marked";

const CONTENT_ROOT = fileURLToPath(new URL("../content/blog/", import.meta.url));
const REPO_ROOT = fileURLToPath(new URL("../", import.meta.url));
const INDEX_OUTPUT = new URL("../app/generated/blog-index.json", import.meta.url);
const CONTENT_OUTPUT = new URL("../app/generated/blog-content.json", import.meta.url);
const SOURCE_OUTPUT = new URL("../app/generated/source-files.json", import.meta.url);
const PUBLIC_ARTICLE_ROOT = fileURLToPath(new URL("../public/api/articles/", import.meta.url));
const LANGUAGE_ORDER = { zh: 0, en: 1, ja: 2 };
const LANGUAGES = Object.keys(LANGUAGE_ORDER);
const execFileAsync = promisify(execFile);
const SOURCE_FILES = [
  "app/_seo/json-ld.tsx",
  "app/_studio/components/immersive-studio.tsx",
  "app/_studio/components/studio-blog-archive.tsx",
  "app/_studio/components/studio-footer.tsx",
  "app/_studio/components/studio-header.tsx",
  "app/_studio/content.module.css",
  "app/_studio/studio.module.css",
  "app/blog/[...slug]/page.tsx",
  "app/blog/page.tsx",
  "app/friends/page.tsx",
  "app/layout.tsx",
  "app/page.tsx",
  "app/robots.ts",
  "app/seo.ts",
  "app/sitemap.ts",
  "app/resume/page.tsx",
  "crowdin.yml",
  "next.config.ts",
  "package.json",
  "README.md",
  "scripts/sync-blog-articles.mjs",
  "tests/rendered-html.test.mjs",
];

function sourceLanguage(relativePath) {
  const extension = path.extname(relativePath).slice(1).toLocaleLowerCase();
  return ({ tsx: "typescriptreact", ts: "typescript", mjs: "javascript", css: "css", json: "json", yml: "yaml", md: "markdown" })[extension] ?? "plaintext";
}

async function collectSourceFiles() {
  return Promise.all(SOURCE_FILES.sort().map(async (relativePath) => ({
    path: relativePath,
    name: path.posix.basename(relativePath),
    language: sourceLanguage(relativePath),
    content: await readFile(path.join(REPO_ROOT, ...relativePath.split("/")), "utf8"),
  })));
}

function parseFrontmatter(markdown) {
  const frontmatter = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  const title = frontmatter?.[1]
    .match(/^title:\s*(.+)$/m)?.[1]
    ?.trim()
    .replace(/^['"]|['"]$/g, "");

  return {
    title,
    body: frontmatter ? markdown.slice(frontmatter[0].length) : markdown,
  };
}

function plainText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_~|]/g, " ")
    .replace(/\\/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function makeDescription(title, body) {
  const proseOnly = body.replace(/```[\s\S]*?```/g, " ");
  const paragraphs = proseOnly
    .split(/\n\s*\n/)
    .map(plainText)
    .filter((text) => text.length >= 24 && !/^https?:\/\//.test(text));

  if (paragraphs[0]) {
    return paragraphs[0].length > 112
      ? `${paragraphs[0].slice(0, 109).trim()}…`
      : paragraphs[0];
  }

  const topics = [...body.matchAll(/^#{2,4}\s+(.+)$/gm)]
    .map((match) => plainText(match[1]))
    .filter(Boolean)
    .slice(0, 3);

  return topics.length ? topics.join(" / ") : title;
}

function normalizeContainers(markdown) {
  return markdown.replace(
    /^:::\s*(tip|warning|danger|info|details)(?:\s+(.+))?\s*\n([\s\S]*?)\n:::\s*$/gm,
    (_, type, label, content) => {
      const heading = label || type.toUpperCase();
      const quoted = content.split("\n").map((line) => `> ${line}`).join("\n");
      return `> **${heading}**\n>\n${quoted}`;
    },
  );
}

function headingSlug(value, index) {
  const slug = plainText(value)
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `section-${index + 1}`;
}

function makeToc(markdown) {
  return [...markdown.matchAll(/^(#{2,4})\s+(.+)$/gm)].map((match, index) => ({
    depth: match[1].length,
    title: plainText(match[2]),
    id: headingSlug(match[2], index),
  }));
}

function isExternal(value) {
  return /^(https?:|mailto:|tel:|data:)/i.test(value);
}

function resolveContentUrl(value, pageSlug, kind, articleSlugs) {
  if (!value || value.startsWith("#") || /^(mailto:|tel:|data:)/i.test(value)) return value;
  if (isExternal(value)) {
    const external = new URL(value);
    if (external.hostname !== "leetfs.com" && external.hostname !== "www.leetfs.com") return value;
    value = `${external.pathname}${external.search}${external.hash}`;
  }

  const virtualBase = new URL(pageSlug, "https://blog.local");
  const resolved = new URL(value, virtualBase);
  const normalizedPath = resolved.pathname
    .replace(/\.md$/, "")
    .replace(/\.html$/, "")
    .replace(/\/index$/, "");

  if (kind === "asset") {
    return `/blog-assets${resolved.pathname}`;
  }

  if (normalizedPath === "/about/resume") return `/resume${resolved.hash}`;
  if (normalizedPath === "/about") return `/${resolved.hash}`;
  if (articleSlugs.has(normalizedPath)) {
    return `/blog${normalizedPath}${resolved.search}${resolved.hash}`;
  }
  return `/blog${resolved.hash}`;
}

function renderMarkdown(markdown, pageSlug, articleSlugs) {
  const normalized = normalizeContainers(markdown);
  const toc = makeToc(normalized);
  let headingIndex = 0;
  let html = marked.parse(normalized, { gfm: true });

  html = html.replace(/<h([2-4])>([\s\S]*?)<\/h\1>/g, (_, depth, content) => {
    const item = toc[headingIndex++];
    return `<h${depth} id="${item?.id ?? `section-${headingIndex}`}">${content}</h${depth}>`;
  });

  html = html
    .replace(/src="([^"]+)"/g, (_, value) => `src="${resolveContentUrl(value, pageSlug, "asset", articleSlugs)}"`)
    .replace(/href="([^"]+)"/g, (_, value) => `href="${resolveContentUrl(value, pageSlug, "link", articleSlugs)}"`)
    .replace(/<a href=/g, '<a target="_blank" rel="noopener noreferrer" href=');

  return { html, toc };
}

function languageFor(parts) {
  return LANGUAGES.includes(parts[0]) ? parts[0] : null;
}

function contentParts(parts) {
  return languageFor(parts) ? parts.slice(1) : parts;
}

function makeCategory(parts) {
  const canonical = contentParts(parts);
  if (canonical[0] === "life") return "LIFE / NOTES";
  return canonical.slice(1, 3).join(" / ").replaceAll("-", " ").toUpperCase();
}

function makeSection(parts) {
  return contentParts(parts)[0] === "life" ? "生活" : "技术";
}

function makeTopics(parts) {
  return contentParts(parts)
    .slice(1, -1)
    .map((part) => part.replaceAll("-", " ").toUpperCase());
}

function formatDate(value) {
  const date = new Date(value);
  return [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()]
    .map((part, index) => (index === 0 ? String(part) : String(part).padStart(2, "0")))
    .join(".");
}

function stripRendered(article) {
  return Object.fromEntries(
    Object.entries(article).filter(([key]) => key !== "html" && key !== "toc"),
  );
}

async function collectMarkdown(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectMarkdown(absolute);
    return entry.isFile() && entry.name.endsWith(".md") ? [absolute] : [];
  }));
  return nested.flat();
}

function isArticle(relativePath) {
  const parts = relativePath.split("/");
  const canonical = contentParts(parts);
  return (
    languageFor(parts) !== null &&
    (canonical[0] === "tips" || canonical[0] === "life") &&
    canonical.at(-1) !== "index.md"
  );
}

function routeSlugFor(parts) {
  const language = languageFor(parts);
  const canonicalSlug = `/${parts.slice(1).join("/")}`;
  return language === "zh" ? canonicalSlug : `/${language}${canonicalSlug}`;
}

function parseGitDates(output) {
  const dates = new Map();
  let currentDate = null;
  for (const rawLine of output.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.startsWith("__GIT_DATE__")) {
      currentDate = line.slice("__GIT_DATE__".length);
    } else if (line && currentDate && !dates.has(line)) {
      dates.set(line, currentDate);
    }
  }
  return dates;
}

async function gitLogDates(repoRoot, diffFilter, pathspec) {
  try {
    const { stdout } = await execFileAsync("git", [
      "-c", `safe.directory=${repoRoot}`,
      "-C", repoRoot,
      "log", "--no-renames", "--format=__GIT_DATE__%cI", "--name-only",
      `--diff-filter=${diffFilter}`, "--", pathspec,
    ], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
    return parseGitDates(stdout);
  } catch {
    return new Map();
  }
}

async function collectGitDates() {
  let repoRoot;
  try {
    ({ stdout: repoRoot } = await execFileAsync("git", [
      "-c", `safe.directory=${process.cwd()}`,
      "-C", process.cwd(), "rev-parse", "--show-toplevel",
    ], { encoding: "utf8" }));
  } catch {
    return {
      currentModified: new Map(),
      currentAdded: new Map(),
      legacy: new Map(),
      legacyAdded: new Map(),
    };
  }
  repoRoot = repoRoot.trim();
  const [currentModified, currentAdded, legacy, legacyAdded] = await Promise.all([
    gitLogDates(repoRoot, "M", "content/blog"),
    gitLogDates(repoRoot, "A", "content/blog"),
    gitLogDates(repoRoot, "AM", "docs"),
    gitLogDates(repoRoot, "A", "docs"),
  ]);
  return { currentModified, currentAdded, legacy, legacyAdded };
}

function legacyGitPath(relative) {
  const [language, ...canonicalParts] = relative.split("/");
  const legacyRelative = canonicalParts.join("/").replace(/vp-font-switch\.md$/, "vp-fontSwitch.md");
  return language === "zh" ? `docs/${legacyRelative}` : `docs/${language}/${legacyRelative}`;
}

function gitDateFor(relative, gitDates) {
  const currentPath = `content/blog/${relative}`;
  return gitDates.currentModified.get(currentPath)
    ?? gitDates.legacy.get(legacyGitPath(relative))
    ?? gitDates.currentAdded.get(currentPath)
    ?? null;
}

function gitPublishedDateFor(relative, gitDates) {
  const currentPath = `content/blog/${relative}`;
  return gitDates.legacyAdded.get(legacyGitPath(relative))
    ?? gitDates.currentAdded.get(currentPath)
    ?? null;
}

async function sync() {
  const sourceFiles = await collectSourceFiles();
  const gitDates = await collectGitDates();
  const files = (await collectMarkdown(CONTENT_ROOT))
    .map((absolute) => ({
      absolute,
      relative: path.relative(CONTENT_ROOT, absolute).split(path.sep).join("/"),
    }))
    .filter(({ relative }) => isArticle(relative));

  const articleSlugs = new Set(
    files.map(({ relative }) => routeSlugFor(relative.replace(/\.md$/, "").split("/"))),
  );

  const hydrated = await Promise.all(files.map(async ({ absolute, relative }) => {
    const markdown = await readFile(absolute, "utf8");
    const { title, body } = parseFrontmatter(markdown);
    if (!title) return null;

    const parts = relative.replace(/\.md$/, "").split("/");
    const language = languageFor(parts);
    const slug = routeSlugFor(parts);
    const canonicalSlug = `/${parts.slice(1).join("/")}`;
    const fileStats = await stat(absolute);
    const gitUpdatedAt = gitDateFor(relative, gitDates);
    const gitPublishedAt = gitPublishedDateFor(relative, gitDates);
    const updatedAt = gitUpdatedAt ?? fileStats.mtime.toISOString();
    const publishedAt = gitPublishedAt ?? gitUpdatedAt ?? fileStats.birthtime.toISOString();
    const characterCount = plainText(body).replace(/\s/g, "").length;
    const rendered = renderMarkdown(body, slug, articleSlugs);

    return {
      category: makeCategory(parts),
      section: makeSection(parts),
      language,
      canonicalSlug,
      topics: makeTopics(parts),
      title,
      description: makeDescription(title, body),
      href: `/blog${slug}`,
      slug,
      publishedAt,
      updatedAt,
      dateSource: gitUpdatedAt ? "git" : "filesystem",
      displayDate: formatDate(updatedAt),
      readingMinutes: Math.max(1, Math.ceil(characterCount / 420)),
      html: rendered.html,
      toc: rendered.toc,
    };
  }));

  const articles = hydrated
    .filter(Boolean)
    .sort((a, b) => {
      const byDate = Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
      return byDate || LANGUAGE_ORDER[a.language] - LANGUAGE_ORDER[b.language];
    });

  const languageNumbers = Object.fromEntries(LANGUAGES.map((language) => [language, 0]));
  const numbered = articles.map((article) => {
    languageNumbers[article.language] += 1;
    return {
      number: `N${String(languageNumbers[article.language]).padStart(3, "0")}`,
      ...article,
    };
  });
  const chineseArticles = numbered.filter((article) => article.language === "zh");
  if (chineseArticles.length < 3) {
    throw new Error(`Expected at least 3 Chinese articles, received ${chineseArticles.length}`);
  }

  const generatedAt = new Date().toISOString();
  const metadataArticles = numbered.map(stripRendered);
  const languageCounts = Object.fromEntries(
    LANGUAGES.map((language) => [
      language,
      numbered.filter((article) => article.language === language).length,
    ]),
  );
  const documentCount = new Set(numbered.map((article) => article.canonicalSlug)).size;
  const sectionCounts = chineseArticles.reduce((counts, article) => {
    counts[article.section] = (counts[article.section] ?? 0) + 1;
    return counts;
  }, {});

  await mkdir(new URL("../app/generated/", import.meta.url), { recursive: true });
  await rm(PUBLIC_ARTICLE_ROOT, { recursive: true, force: true });
  await mkdir(PUBLIC_ARTICLE_ROOT, { recursive: true });
  const missingGitDates = numbered.filter((article) => article.dateSource !== "git");
  if (process.env.REQUIRE_GIT_DATES === "1" && missingGitDates.length) {
    throw new Error(`Git history is missing for ${missingGitDates.length} article translations.`);
  }
  const publicArticles = numbered.map((article) => {
    const output = path.join(PUBLIC_ARTICLE_ROOT, `${article.slug.slice(1)}.json`);
    return mkdir(path.dirname(output), { recursive: true })
      .then(() => writeFile(output, `${JSON.stringify(article)}\n`, "utf8"));
  });
  const legacyArticle = numbered.find((article) => article.slug === "/tips/front/vp-font-switch");
  if (legacyArticle) {
    const legacyOutput = path.join(PUBLIC_ARTICLE_ROOT, "tips/front/vp-fontSwitch.json");
    publicArticles.push(
      mkdir(path.dirname(legacyOutput), { recursive: true })
        .then(() => writeFile(legacyOutput, `${JSON.stringify(legacyArticle)}\n`, "utf8")),
    );
  }
  await Promise.all([
    writeFile(INDEX_OUTPUT, `${JSON.stringify({
      generatedAt,
      source: "content/blog/{locale}",
      total: documentCount,
      translationTotal: numbered.length,
      languageCounts,
      sectionCounts,
      articles: metadataArticles,
    }, null, 2)}\n`, "utf8"),
    writeFile(CONTENT_OUTPUT, `${JSON.stringify({
      generatedAt,
      source: "content/blog/{locale}",
      articles: numbered,
    }, null, 2)}\n`, "utf8"),
    writeFile(SOURCE_OUTPUT, `${JSON.stringify({
      generatedAt,
      source: "curated repository files",
      files: sourceFiles,
    }, null, 2)}\n`, "utf8"),
    ...publicArticles,
  ]);

  console.log(
    `[blog-sync] ${documentCount} documents / ${numbered.length} translations (${numbered.length - missingGitDates.length} git-dated) / ${sourceFiles.length} source files`,
  );
}

await sync();
