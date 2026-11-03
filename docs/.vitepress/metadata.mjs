export const origin = 'https://leetfs.com'
const author = { '@type': 'Person', '@id': origin + '/#person', name: 'Lee', url: origin + '/about/' }
const languages = [['zh', ''], ['en', '/en'], ['ja', '/ja']]

function route(file) {
  return '/' + file.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
}

function alternates(path, available) {
  const suffix = path.replace(/^\/(en|ja)(?=\/)/, '')
  const links = languages.map(([lang, prefix]) => ({ lang, url: prefix + suffix }))
    .filter(link => available.has(link.url))
  if (available.has(suffix)) links.push({ lang: 'x-default', url: suffix })
  return links.map(({ lang, url }) => ({ lang, url: origin + url }))
}

export function sitemapItems(items, dates) {
  const paths = new Set(items.map(item => new URL(item.url, origin).pathname))
  return items.map(item => {
    const path = new URL(item.url, origin).pathname
    const file = (path.endsWith('/') ? path + 'index' : path).slice(1) + '.md'
    return { ...item, lastmod: dates.get(file)?.modified ?? item.lastmod, links: alternates(path, paths) }
  })
}

export function pageHead({ pageData, siteConfig }, dates) {
  if (pageData.isNotFound || pageData.relativePath === '404.md') return []
  const path = route(pageData.relativePath)
  const url = origin + path
  const lang = /^\/(en|ja)\//.exec(path)?.[1] ?? 'zh'
  const native = path.replace(/^\/(en|ja)(?=\/)/, '')
  const isArticle = /^\/(tips|life)\//.test(native) && !native.endsWith('/')
  const title = pageData.frontmatter.title || pageData.title || "Lee's blog"
  const links = alternates(path, new Set(siteConfig.pages.map(route)))
  const tags = [
    ['link', { rel: 'canonical', href: url }],
    ...links.map(link => ['link', { rel: 'alternate', hreflang: link.lang, href: link.url }]),
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:url', content: url }],
    ['meta', { property: 'og:type', content: isArticle ? 'article' : 'website' }],
    ['meta', { property: 'og:locale', content: { zh: 'zh_CN', en: 'en_US', ja: 'ja_JP' }[lang] }],
    ['meta', { name: 'twitter:title', content: title }],
  ]
  const data = { '@context': 'https://schema.org', url, name: title, inLanguage: lang }
  if (isArticle) {
    const history = dates.get(pageData.relativePath)
    Object.assign(data, { '@type': 'BlogPosting', headline: title, author })
    if (history) {
      Object.assign(data, { datePublished: history.published, dateModified: history.modified })
      tags.push(['meta', { property: 'article:published_time', content: history.published }],
        ['meta', { property: 'article:modified_time', content: history.modified }])
    }
  } else if (native === '/') {
    Object.assign(data, { '@type': 'WebSite', author })
  } else if (native.startsWith('/about/')) {
    Object.assign(data, { '@type': 'ProfilePage', mainEntity: author })
  } else {
    data['@type'] = /^\/(tips|life)\/$/.test(native) ? 'Blog' : 'CollectionPage'
  }
  tags.push(['script', { type: 'application/ld+json' }, JSON.stringify(data).replace(/</g, '\\u003c')])
  return tags
}
