import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const relative = pathname === "/"
    ? "index.html"
    : pathname.endsWith(".json")
      ? pathname.slice(1)
      : `${pathname.replace(/^\//, "").replace(/\/$/, "")}/index.html`;
  try {
    const body = await readFile(new URL(`../out/${relative}`, import.meta.url));
    return new Response(body, {
      status: 200,
      headers: { "content-type": relative.endsWith(".json") ? "application/json" : "text/html" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

test("exports the interactive studio as the homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Lee<\/title>/i);
  assert.match(html, /LEE/);
  assert.match(html, /UNITY/);
  assert.match(html, /RISC-V 开发板/);
  assert.doesNotMatch(html, /RISC-V Dev Board/);
  assert.doesNotMatch(html, /BUILD CLOSE TO THE SYSTEM|返回原版|Original/);
});

test("exports every canonical content route", async () => {
  for (const pathname of ["/blog", "/resume", "/friends", "/blog/tips/system/linux/package"]) {
    const response = await render(pathname);
    assert.equal(response.status, 200, pathname);
  }

  const [home, blog, resume, friends] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/blog/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/resume/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/friends/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(home, /ImmersiveStudio/);
  assert.match(blog, /StudioBlogArchive/);
  assert.match(resume, /StudioHeader/);
  assert.match(friends, /StudioHeader/);
  assert.doesNotMatch(`${blog}${resume}${friends}`, /Minimal(?:Blog|Resume|Friends|Article)/);

  await assert.rejects(access(new URL("../app/components", import.meta.url)));
  await assert.rejects(access(new URL("../app/minimal", import.meta.url)));
  await assert.rejects(access(new URL("../app/api", import.meta.url)));
});

test("keeps Unity interactions and project assets wired", async () => {
  const [studio, studioCss, archive, contentHeader] = await Promise.all([
    readFile(new URL("../app/_studio/components/immersive-studio.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/_studio/studio.module.css", import.meta.url), "utf8"),
    readFile(new URL("../app/_studio/components/studio-blog-archive.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/_studio/components/studio-header.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(studio, /onClick=\{\(\) => \{ selectObject\(id\); queueMicrotask\(frameSelected\); \}\}/);
  assert.match(studio, /addEventListener\("contextmenu", onContextMenu\)/);
  assert.match(studio, /SCENE_STORAGE_KEY/);
  assert.match(studio, /localizedArticles\.map\(\(article\) =>/);
  assert.match(studio, /assetView === "list"/);
  assert.match(studio, /application\/x-lee-unity-model/);
  assert.match(studio, /createSceneObject/);
  assert.match(studio, /CreateCategory/);
  assert.match(studio, /directionalLight/);
  assert.match(studio, /perspectiveCamera/);
  assert.match(studio, /particleSystem/);
  assert.match(studio, /layoutTools/);
  assert.match(studio, /useState<Locale>\("zh"\)/);
  assert.match(archive, /useState<Locale>\("zh"\)/);
  assert.match(studio, /panelFullscreen/);
  assert.match(studio, /bottomPanelBeforeFullscreenRef/);
  assert.match(studio, /setBottomPanelVisible\(false\)/);
  assert.match(studio, /profileProjects/);
  assert.match(studio, /name: "openRuyi"/);
  assert.match(studio, /openRuyi Linux 发行版开发/);
  assert.match(studio, /openArticlePreview/);
  assert.match(studio, /\/api\/articles\/\$\{slug\}\.json/);
  assert.match(studio, /useState<ProjectFolder>\("Website"\)/);
  assert.match(studio, /website-blog/);
  assert.match(studio, /beginPanelResize/);
  assert.match(studio, /toggle-bottom/);
  assert.match(studio, /portal\.rotation\.y = -Math\.PI \/ 2/);
  assert.match(studio, /new Reflector/);
  assert.match(studio, /renderer\.shadowMap\.enabled = balanced/);
  assert.match(studio, /motionSettingsRef/);
  assert.match(studio, /playingRef\.current/);
  assert.match(studio, /onClick=\{\(\) => openProjectAsset\(asset\)\}/);
  assert.doesNotMatch(studio, /onDoubleClick=\{\(\) => openProjectAsset\(asset\)\}/);
  assert.doesNotMatch(studio, /toolMode\.toUpperCase\(\)/);
  assert.doesNotMatch(studio, /openLandmark|moduleDock/);
  assert.doesNotMatch(studio, /t\.ready|ready:\s*"|就绪|準備完了/);
  assert.match(studioCss, /grid-template-rows:\s*34px minmax\(0, 1fr\)/);
  assert.match(studioCss, /scroll-padding-bottom:\s*42px/);
  assert.match(studioCss, /assetPanelFullscreen\s*\{[^}]*inset:\s*42px 16px 16px/);
  assert.match(studio, /event\.key === "w"/);
  assert.doesNotMatch(studio, /模型已压缩|阴影关闭|Compressed models/);
  assert.match(contentHeader, /innerMenuBar/);
  assert.match(contentHeader, /Assets \/ Content/);
});

test("exports article content for the in-editor preview", async () => {
  const response = await render("/api/articles/tips/system/linux/package.json");
  assert.equal(response.status, 200);
  const article = await response.json();
  assert.equal(article.title, "打包修包指南");
  assert.match(article.html, /<h2/);
});

test("keeps the renamed Crowdin-friendly article URL backward compatible", async () => {
  for (const pathname of [
    "/api/articles/tips/front/vp-font-switch.json",
    "/api/articles/tips/front/vp-fontSwitch.json",
    "/blog/tips/front/vp-fontSwitch",
  ]) {
    const response = await render(pathname);
    assert.equal(response.status, 200, pathname);
  }
});

test("keeps blog sources locale-first and dates them from Git", async () => {
  const contentRoot = new URL("../content/blog/", import.meta.url);
  const [files, rawIndex, crowdinConfig] = await Promise.all([
    readdir(contentRoot, { recursive: true }),
    readFile(new URL("../app/generated/blog-index.json", import.meta.url), "utf8"),
    readFile(new URL("../crowdin.yml", import.meta.url), "utf8"),
  ]);
  const blogIndex = JSON.parse(rawIndex);
  const normalizedFiles = files.map((file) => file.replaceAll("\\", "/"));
  const markdown = normalizedFiles.filter((file) => file.endsWith(".md"));
  const nonMarkdown = normalizedFiles.filter((file) => file.includes(".") && !file.endsWith(".md"));
  const canonicalSlugs = new Set(blogIndex.articles.map((article) => article.canonicalSlug));

  assert.ok(markdown.length > 0);
  assert.ok(markdown.every((file) => /^(zh|en|ja)\//.test(file)));
  assert.ok(markdown.every((file) => file === file.toLocaleLowerCase()));
  assert.ok(markdown.every((file) => !file.endsWith("/index.md")));
  assert.ok(markdown.every((file) => !/(^|\/)(about|friendly)(\/|$)/.test(file)));
  assert.deepEqual(nonMarkdown, []);
  assert.equal(blogIndex.total, canonicalSlugs.size);
  assert.equal(blogIndex.translationTotal, blogIndex.articles.length);
  assert.equal(markdown.length, blogIndex.translationTotal);
  if (process.env.REQUIRE_GIT_DATES === "1") {
    assert.ok(blogIndex.articles.every((article) => article.dateSource === "git"));
  }
  for (const language of ["zh", "en", "ja"]) {
    const localized = blogIndex.articles.filter((article) => article.language === language);
    assert.equal(blogIndex.languageCounts[language], localized.length);
    assert.equal(new Set(localized.map((article) => article.canonicalSlug)).size, blogIndex.total);
  }
  assert.match(crowdinConfig, /source:\s*\/content\/blog\/zh\/\*\*\/\*\.md/);
  assert.match(crowdinConfig, /translation:\s*\/content\/blog\/%two_letters_code%\/\*\*\/%original_file_name%/);
  assert.match(crowdinConfig, /preserve_hierarchy:\s*true/);

  await assert.rejects(access(new URL("../content/blog/tips", import.meta.url)));
  await assert.rejects(access(new URL("../content/blog/life", import.meta.url)));
  await assert.rejects(access(new URL("../content/blog/migration-dates.json", import.meta.url)));
});

test("contains no retired starter or Cloudflare infrastructure", async () => {
  for (const path of ["../.openai", "../build", "../db", "../drizzle", "../examples", "../worker"]) {
    await assert.rejects(access(new URL(path, import.meta.url)), path);
  }
  const gitignore = await readFile(new URL("../.gitignore", import.meta.url), "utf8");
  assert.match(gitignore, /^\/\.agents\/$/m);
  assert.match(gitignore, /^\/\.openai\/$/m);
  for (const model of ["portal-door.glb", "riscv-board.glb", "terminal.glb"]) {
    await assert.rejects(access(new URL(`../public/models/${model}`, import.meta.url)), model);
  }
});
