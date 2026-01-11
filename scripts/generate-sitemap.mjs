import fs from 'node:fs'
import path from 'node:path'

// Canonical site URL (prefer env, fallback to WWW)
const SITE = String(process.env.NUXT_PUBLIC_SITE_URL)
  .trim()
  .replace(/\/+$/, '') // remove trailing slash on domain only

const CONTENT_DIR = path.resolve(process.cwd(), 'content')
const OUT_FILE = path.resolve(process.cwd(), 'public', 'sitemap.xml')

// Read locales from a Node-safe JSON file (single source of truth)
const LOCALE_DATA_FILE = path.resolve(process.cwd(), 'assets/js/localization.data.json')
const LOCALE_DATA = JSON.parse(fs.readFileSync(LOCALE_DATA_FILE, 'utf8'))
const LOCALE_DEFS = LOCALE_DATA?.locales || []

const LOCALES = LOCALE_DEFS.map(l => l.code)
const DEFAULT_LOCALE = (LOCALE_DEFS.find(l => l.default) || LOCALE_DEFS[0] || { code: 'en' }).code

function hreflangFor(code) {
  const def = LOCALE_DEFS.find(l => l.code === code)
  return def?.language || code
}

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

  if (restParts.length === 0) restParts = []
  if (restParts.length === 1 && ['home', 'index'].includes(restParts[0].toLowerCase())) restParts = []

  if (restParts[restParts.length - 1]?.toLowerCase() === 'index') restParts = restParts.slice(0, -1)

  const rest = restParts.join('/')
  return { locale, rest }
}

function withTrailingSlash(p) {
  if (p === '/') return '/'
  return p.endsWith('/') ? p : `${p}/`
}

function unprefixedPath(rest) {
  return withTrailingSlash(rest ? `/${rest}` : '/')
}

function prefixedPath(locale, rest) {
  return withTrailingSlash(rest ? `/${locale}/${rest}` : `/${locale}`)
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

  if (!fs.existsSync(LOCALE_DATA_FILE)) {
    console.error(`Missing locale data file: ${LOCALE_DATA_FILE}`)
    process.exit(1)
  }

  const files = walk(CONTENT_DIR).filter(f => /\.(md|mdc)$/i.test(f))

  const restMap = new Map()

  for (const f of files) {
    const info = fileToLocaleRest(f)
    if (!info) continue

    const { locale, rest } = info

    if (rest === 'blog' || rest === 'architecture') continue

    if (!restMap.has(rest)) restMap.set(rest, new Set())
    restMap.get(rest).add(locale)
  }

  const entries = []

  for (const [rest, localesSet] of restMap.entries()) {
    if (!localesSet.has(DEFAULT_LOCALE)) continue

    const loc = `${SITE}${unprefixedPath(rest)}`
    const alternates = []

    alternates.push({ hreflang: 'x-default', href: loc })

    for (const code of LOCALES) {
      if (!localesSet.has(code)) continue
      alternates.push({
        hreflang: hreflangFor(code),
        href: `${SITE}${prefixedPath(code, rest)}`
      })
    }

    entries.push({ loc, alternates })
  }

  entries.sort((a, b) => a.loc.localeCompare(b.loc))

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map(e => urlNode(e.loc, e.alternates)).join('\n')}
</urlset>
`

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
  fs.writeFileSync(OUT_FILE, xml, 'utf8')
  console.log(`✅ Wrote ${OUT_FILE} with ${entries.length} URL entries`)
  console.log(`ℹ️ SITE=${SITE}`)
}

main()
