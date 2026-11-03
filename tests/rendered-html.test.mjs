import assert from 'node:assert/strict'
import { access, readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const out = fileURLToPath(new URL('../out/', import.meta.url))
const docs = fileURLToPath(new URL('../docs/', import.meta.url))
const html = file => readFile(path.join(out, file), 'utf8')

test('renders the original home, sections, profile and five friends in each language', async () => {
  for (const [prefix, lang, welcome] of [
    ['', 'zh', '欢迎来到我的'],
    ['en/', 'en', 'Welcome to my blog'],
    ['ja/', 'ja', '私のブログへようこそ'],
  ]) {
    const home = await html(prefix + 'index.html')
    assert.ok(home.includes(welcome) && home.includes('src="/logo.png"'))
    assert.ok(home.includes(`lang="${lang}"`))
    for (const section of ['about', 'tips', 'life', 'friendly'])
      assert.ok(home.includes(`href="/${prefix}${section}/"`))
    assert.ok(home.includes('https://github.com/Leetfs/website'))
    const category = await html(prefix + 'tips/git/index.html')
    assert.ok(category.includes(`href="/${prefix}tips/git/github.html"`))
    const profile = await html(prefix + 'about/index.html')
    assert.ok(profile.includes('https://steamcommunity.com/profiles/76561199643388304/'))
    assert.ok((await html(prefix + 'about/resume.html')).includes('openRuyi'))
    const friends = await html(prefix + 'friendly/index.html')
    for (const url of ['https://github.com/lumigj', 'http://nhui.top/', 'https://mdzz.pro/', 'https://www.iacg.moe/', 'https://catherina.moe/'])
      assert.ok(friends.includes(`href="${url}"`), url)
  }
})

test('serves every document, internal link and local image on a plain static host', async () => {
  const pages = (await readdir(docs, { recursive: true })).map(file => file.split(path.sep).join('/'))
    .filter(file => !file.startsWith('.') && file.endsWith('.md'))
  assert.ok(pages.length > 0)
  const targets = new Set()
  for (const file of pages) {
    const route = file.replace(/\.md$/, '.html')
    const page = await html(route)
    assert.match(page, /<div id="app">.+?<\/div>/s, file)
    for (const [, ref] of page.matchAll(/<(?:a|img)\b[^>]*?\b(?:href|src)="([^"]+)"/g)) {
      const url = new URL(ref, 'https://leetfs.com/' + route)
      if (url.origin === 'https://leetfs.com') targets.add(decodeURIComponent(url.pathname))
    }
  }
  for (const target of targets) {
    const file = path.join(out, target)
    if ((await stat(file)).isDirectory()) await access(path.join(file, 'index.html'))
  }
})

test('exposes native canonical URLs, translations and article history to crawlers', async () => {
  const article = await html('tips/system/linux/package.html')
  assert.match(article, /rel="canonical" href="https:\/\/leetfs\.com\/tips\/system\/linux\/package\.html"/)
  for (const lang of ['zh', 'en', 'ja', 'x-default']) assert.ok(article.includes(`hreflang="${lang}"`))
  const graphs = [...article.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)]
    .map(([, json]) => JSON.parse(json))
  const post = graphs.find(data => data['@type'] === 'BlogPosting')
  assert.ok(post?.datePublished && Date.parse(post.datePublished) <= Date.parse(post.dateModified))
  assert.ok((await html('index.html')).includes('"@type":"WebSite"'))
  assert.ok((await html('robots.txt')).includes('Sitemap: https://leetfs.com/sitemap.xml'))
  const sitemap = await html('sitemap.xml')
  assert.ok(sitemap.includes('https://leetfs.com/ja/tips/system/linux/package.html'))
  assert.ok(sitemap.includes('hreflang="x-default"'))
})

test("configures safe Cloudflare Pages previews for pull requests", async () => {
  const [build, publish] = await Promise.all([
    readFile(new URL("../.github/workflows/pr-preview.yml", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/pr-preview-publish.yml", import.meta.url), "utf8"),
  ]);
  assert.match(build, /^\s*pull_request:/m);
  assert.match(build, /actions\/upload-artifact@v4/);
  assert.doesNotMatch(build, /CLOUDFLARE_PAGES_(?:TOKEN|ACCOUNT)|pull_request_target/);
  assert.match(publish, /^\s*workflow_run:/m);
  assert.match(publish, /actions\/download-artifact@v5/);
  assert.match(publish, /ref: \$\{\{ github\.event\.repository\.default_branch \}\}/);
  assert.match(publish, /secrets\.CLOUDFLARE_PAGES_TOKEN/);
  assert.match(publish, /secrets\.CLOUDFLARE_PAGES_ACCOUNT/);
  assert.match(publish, /pages deploy preview-output --project-name=[a-z0-9-]+ --branch=pr-/);
  assert.match(publish, /_worker\.js/);
  assert.match(publish, /pull-requests: write/);
  assert.match(publish, /createComment|updateComment/);
  assert.doesNotMatch(publish, /pull_request_target|ref:\s*\$\{\{\s*github\.event\.workflow_run\.(?:head_sha|head_branch)/);
});
