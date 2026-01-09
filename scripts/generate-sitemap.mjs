import fs from 'node:fs'
import path from 'node:path'

console.log('RUNNING SITEMAP SCRIPT v2 (hreflang)')

const SITE = 'https://blockchange.com.py'
const CONTENT_DIR = path.resolve(process.cwd(), 'content')
const OUT_FILE = path.resolve(process.cwd(), 'public', 'sitemap.xml')

const LOCALES = ['en']          // later: ['en', 'es', 'ru']
const DEFAULT_LOCALE = 'en'     // must match your i18n defaultLocale

function escapeXml(s = '') {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function walk(dir) {
  const out = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

/**
 * From a file like content/en/blog/foo.md
 * return { locale: "en", rest: "blog/foo" } or rest "" for home/index.
 */
function fileToLocaleAndRest(file) {
  const rel = path.relative(CONTENT_DIR, file).replaceAll('\\', '/')
  const noExt = rel.replace(/\.(md|mdc)$/i, '')
  const parts = noExt.split('/').filter(Boolean)
  if (!parts.length) return null

  const locale = parts[0]
  if (!LOCALES.includes(locale)) return null

  let restParts = parts.slice(1)

  // home or index => root
  if (restParts.length === 0) restParts = ['']
  if (restParts.length === 1 && ['home', 'index'].includes(restParts[0].toLowerCase())) {
    restParts = ['']
  }

  // drop trailing index
  if (restParts[restParts.length - 1]?.toLowerCase() === 'index') {
    restParts = restParts.slice(0, -1)
  }

  const rest = restParts.filter(Boolean).join('/')
  return { locale, rest }
}

function pathFor(locale, rest, { unprefixedDefault = false } = {}) {
  const cleanRest = rest ? `/${rest}` : ''
  if (unprefixedDefault && locale === DEFAULT_LOCALE) {
    // default locale without prefix
    return cleanRest || '/'
  }
  // normal prefixed route
  return `/${locale}${cleanRest}`
}

function urlNode({ loc, alternates = [] }) {
  const links = alternates
    .map(a =>
      `    <xhtml:link rel="alternate" hreflang="${escapeXml(a.hreflang)}" href="${escapeXml(a.href)}" />`
    )
    .join('\n')

  return `  <url>
    <loc>${escapeXml(loc)}</loc>
${links ? links + '\n' : ''}  </url>`
}

function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`Missing content dir: ${CONTENT_DIR}`)
    process.exit(1)
  }

  const files = walk(CONTENT_DIR).filter(f => /\.(md|mdc)$/i.test(f))

  // Map "rest path" => locales that exist for it (based on content files)
  const restToLocales = new Map()

  for (const f of files) {
    const info = fileToLocaleAndRest(f)
    if (!info) continue
    const { locale, rest } = info

    // Only include pages that have DEFAULT_LOCALE content, otherwise we can’t build a /unprefixed loc.
    // (If you want to include non-default-only pages too, say so.)
    if (!restToLocales.has(rest)) restToLocales.set(rest, new Set())
    restToLocales.get(rest).add(locale)
  }

  // Build sitemap entries
  const entries = []

  for (const [rest, localesSet] of restToLocales.entries()) {
    if (!localesSet.has(DEFAULT_LOCALE)) continue

    // Primary loc is the unprefixed default URL: /test (or / for home)
    const locPath = pathFor(DEFAULT_LOCALE, rest, { unprefixedDefault: true })
    const loc = `${SITE}${locPath === '/' ? '/' : locPath}`

    const alternates = []

    // x-default points to the default (unprefixed) URL
    alternates.push({ hreflang: 'x-default', href: loc })

    // Add all locale-prefixed versions that exist
    for (const l of LOCALES) {
      if (!localesSet.has(l)) continue
      const hrefPath = pathFor(l, rest, { unprefixedDefault: false })
      alternates.push({ hreflang: l, href: `${SITE}${hrefPath}` })
    }

    entries.push({ loc, alternates })
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${entries
      .sort((a, b) => a.loc.localeCompare(b.loc))
      .map(urlNode)
      .join('\n')}
</urlset>
`

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
  fs.writeFileSync(OUT_FILE, xml, 'utf8')
  console.log(`✅ Wrote ${OUT_FILE} with ${entries.length} URL entries`)
}

main()
