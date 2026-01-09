import fs from 'node:fs'
import path from 'node:path'

const SITE = 'https://blockchange.com.py'

const CONTENT_DIR = path.resolve(process.cwd(), 'content')
const OUT_FILE = path.resolve(process.cwd(), 'public', 'sitemap.xml')

const LOCALES = ['en']        // later: ['en', 'es', 'ru']
const DEFAULT_LOCALE = 'en'   // must match your i18n defaultLocale

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
 * content/en/blog/foo.md -> { locale: 'en', rest: 'blog/foo' }
 * content/en/home.md     -> { locale: 'en', rest: '' }
 */
function fileToLocaleRest(file) {
  const rel = path.relative(CONTENT_DIR, file).replaceAll('\\', '/')
  const noExt = rel.replace(/\.(md|mdc)$/i, '')
  const parts = noExt.split('/').filter(Boolean)
  if (!parts.length) return null

  const locale = parts[0]
  if (!LOCALES.includes(locale)) return null

  let restParts = parts.slice(1)

  // home/index -> root
  if (restParts.length === 0) restParts = []
  if (restParts.length === 1 && ['home', 'index'].includes(restParts[0].toLowerCase())) restParts = []

  // drop trailing index
  if (restParts[restParts.length - 1]?.toLowerCase() === 'index') restParts = restParts.slice(0, -1)

  const rest = restParts.join('/')
  return { locale, rest }
}

function unprefixedPath(rest) {
  return rest ? `/${rest}` : '/'
}

function prefixedPath(locale, rest) {
  return rest ? `/${locale}/${rest}` : `/${locale}`
}

function urlNode(loc, alternates) {
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

  // restPath -> Set(locales with that page)
  const restMap = new Map()

  for (const f of files) {
    const info = fileToLocaleRest(f)
    if (!info) continue

    const { locale, rest } = info

    // exclude ONLY the listing endpoints (exact pages)
    if (rest === 'blog' || rest === 'architecture') continue

    if (!restMap.has(rest)) restMap.set(rest, new Set())
    restMap.get(rest).add(locale)
  }

  const entries = []

  for (const [rest, localesSet] of restMap.entries()) {
    // only publish if default locale exists, so loc can be unprefixed
    if (!localesSet.has(DEFAULT_LOCALE)) continue

    const loc = `${SITE}${unprefixedPath(rest)}`
    const alternates = []

    // default
    alternates.push({ hreflang: 'x-default', href: loc })

    // all locale-prefixed variants that exist (currently en only)
    for (const l of LOCALES) {
      if (!localesSet.has(l)) continue
      alternates.push({ hreflang: l, href: `${SITE}${prefixedPath(l, rest)}` })
    }

    entries.push({ loc, alternates })
  }

  entries.sort((a, b) => a.loc.localeCompare(b.loc))

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${entries.map(e => urlNode(e.loc, e.alternates)).join('\n')}
</urlset>
`

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
  fs.writeFileSync(OUT_FILE, xml, 'utf8')
  console.log(`✅ Wrote ${OUT_FILE} with ${entries.length} URL entries`)
}

main()
