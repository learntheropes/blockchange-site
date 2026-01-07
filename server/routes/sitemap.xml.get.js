import { locales, defaultLocale } from '~/assets/js/localization'

function escapeXml(s = '') {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function stripExt(key) {
  return String(key || '').replace(/\.(md|mdc|json|yml|yaml)$/i, '')
}

function normalizeKey(key) {
  return stripExt(key)
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
}

function isLocale(code) {
  return (locales || []).some(l => l.code === code)
}

// Robust conversion of storage keys -> route path
function keyToPath(key) {
  let k = normalizeKey(key)
  if (!k) return null

  // 1) Handle colon format: "en:blog:slug"
  if (k.includes(':')) {
    const parts = k.split(':').filter(Boolean)

    // Drop leading garbage tokens if present (rare but safe)
    while (parts.length && !isLocale(parts[0]) && ['source', 'content', 'raw'].includes(parts[0])) {
      parts.shift()
    }

    if (parts.length < 2) return null
    const locale = parts[0]
    if (!isLocale(locale)) return null

    const rest = parts.slice(1)

    // home -> locale root
    if (rest.length === 1 && rest[0].toLowerCase() === 'home') {
      return `/${locale}`
    }

    // index -> locale root too (in case you ever have it)
    if (rest.length === 1 && rest[0].toLowerCase() === 'index') {
      return `/${locale}`
    }

    return `/${locale}/${rest.join('/')}`
  }

  // 2) Handle slash format: "source/en/home" or "en/blog/slug"
  let segs = k.split('/').filter(Boolean)
  if (!segs.length) return null

  // Drop leading storage prefixes until the first segment is a locale
  while (segs.length && !isLocale(segs[0]) && ['source', 'content', 'raw', 'files'].includes(segs[0])) {
    segs.shift()
  }

  if (!segs.length) return null

  // If still not a locale, but the second one is, drop the first (super defensive)
  if (!isLocale(segs[0]) && segs[1] && isLocale(segs[1])) {
    segs.shift()
  }

  const locale = segs[0]
  if (!isLocale(locale)) return null

  const rest = segs.slice(1)

  // home/index -> locale root
  if (rest.length === 0) return `/${locale}`
  if (rest.length === 1 && ['home', 'index'].includes(rest[0].toLowerCase())) return `/${locale}`

  // drop trailing "index"
  if (rest[rest.length - 1]?.toLowerCase() === 'index') rest.pop()

  return `/${locale}/${rest.join('/')}`
}

export default defineEventHandler(async (event) => {
  const siteUrl = 'https://blockchange.com.py'

  // IMPORTANT: keep your existing storage namespace
  const storage = useStorage('content')
  const keys = await storage.getKeys()

  const seen = new Set()
  const urlNodes = []

  function addPath(path) {
    if (!path) return

    // OPTIONAL: if you want default locale homepage ALSO at "/"
    // (common when you redirect "/" -> "/en")
    if (defaultLocale && path === `/${defaultLocale}`) {
      const rootLoc = `${siteUrl}/`
      if (!seen.has(rootLoc)) {
        seen.add(rootLoc)
        urlNodes.push(`  <url><loc>${escapeXml(rootLoc)}</loc></url>`)
      }
    }

    const loc = `${siteUrl}${path}`
    if (seen.has(loc)) return
    seen.add(loc)
    urlNodes.push(`  <url><loc>${escapeXml(loc)}</loc></url>`)
  }

  // Always include these section roots (so sitemap is never useless)
  addPath('/')
  for (const l of locales || []) {
    addPath(`/${l.code}`)
    addPath(`/${l.code}/blog`)
    addPath(`/${l.code}/architecture`)
  }

  // Add dynamic pages from storage
  for (const key of keys) {
    const path = keyToPath(key)
    addPath(path)
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlNodes.join('\n')}
</urlset>`

  event.node.res.setHeader('content-type', 'application/xml; charset=UTF-8')
  return xml
})
