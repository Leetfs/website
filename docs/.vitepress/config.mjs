import { statSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import projectTrans from '@project-trans/vitepress-theme-project-trans/config'
import { withThemeContext } from '@project-trans/vitepress-theme-project-trans/utils'
import { defineConfig } from 'vitepress'
import { readHistory } from './history.mjs'
import { origin, pageHead, sitemapItems } from './metadata.mjs'

const sections = ['about', 'tips', 'life', 'friendly']
const languages = [
  { key: 'root', lang: 'zh', label: '简体中文', prefix: '/', labels: ['首页', '关于', '一些经验', '生活琐事', '友情链接', '开往'] },
  { key: 'en', lang: 'en', label: 'English', prefix: '/en/', labels: ['Home', 'About', 'Some experience', 'Daily Life', 'Friendly links', 'Bound for'] },
  { key: 'ja', lang: 'ja', label: '日本語', prefix: '/ja/', labels: ['ホーム', 'について', 'いくつかの経験', '日常の雑事', '友達のリンク', '向かう'] },
]

function navigation({ prefix, labels }) {
  const links = [prefix, ...sections.map(section => prefix + section + '/'), 'https://www.travellings.cn/go.html']
  return links.map((link, index) => ({ text: labels[index], link }))
}

const site = withThemeContext({
  rootDir: 'docs',
  sitePattern: 'docs',
  siteTitle: "Lee's blog",
  siteLogo: '/icon-1024x1024.png',
  githubRepoLink: 'https://github.com/Leetfs/website',
  hostName: origin,
  enableSuggestionBox: false,
  nav: navigation(languages[0]),
  sidebarOptions: languages.flatMap(({ prefix }) => sections.map(section => ({
    documentRootPath: 'docs',
    scanStartPath: prefix.slice(1) + section,
    resolvePath: prefix + section + '/',
    useTitleFromFrontmatter: true,
    useFolderTitleFromIndexFile: true,
    useFolderLinkFromIndexFile: true,
    collapsed: true,
  }))),
  locales: Object.fromEntries(languages.map(language => [language.key, {
    label: language.label,
    lang: language.lang,
    link: language.prefix,
    themeConfig: { nav: navigation(language) },
  }])),
}, projectTrans)
const dates = readHistory()

export default defineConfig({
  ...site,
  description: '偶尔的废话和些许经验',
  cleanUrls: false,
  outDir: '../out',
  head: [
    ['link', { rel: 'icon', href: '/favicon-32x32.png', type: 'image/png' }],
    ['link', { rel: 'apple-touch-icon', href: '/icon-1024x1024.png' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    ['meta', { property: 'og:site_name', content: "Lee's blog" }],
    ['meta', { property: 'og:image', content: origin + '/icon-1024x1024.png' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:creator', content: '@leetfs1' }],
  ],
  sitemap: { hostname: origin, transformItems: items => sitemapItems(items, dates) },
  markdown: { ...site.markdown, languageAlias: { conf: 'ini' } },
  vite: {
    ...site.vite,
    build: { emptyOutDir: true },
    ssr: { noExternal: [/^@project-trans\//, /^@nolebase\//] },
  },
  transformPageData(page, context) {
    const data = site.transformPageData(page, context)
    const date = dates.get(page.relativePath)
    if (!date && process.env.REQUIRE_GIT_DATES === '1' && page.relativePath !== '404.md')
      throw new Error('Missing Git history for ' + page.relativePath)
    data.lastUpdated = date
      ? Date.parse(date.modified)
      : statSync(path.join(context.siteConfig.srcDir, page.relativePath), { throwIfNoEntry: false })?.mtimeMs
    return data
  },
  transformHead: context => pageHead(context, dates),
})
