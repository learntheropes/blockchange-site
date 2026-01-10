import fs from 'node:fs'
import path from 'node:path'

const SITE = 'https://www.blockchange.com.py'

const CONTENT_DIR = path.resolve(process.cwd(), 'content')
const OUT_FILE = path.resolve(process.cwd(), 'public', 'sitemap.xml')

const LOCALE_DATA_FILE = path.resolve(process.cwd(), 'assets/js/localization.data.json')
const LOCALE_DATA = JSON.parse(fs.readFileSync(LOCALE_DATA_FILE, 'utf8'))
const LOCALE_DEFS = LOCALE_DATA.locales || []

const LOCALES = LOCALE_DEFS.map(l => l.code)
const DEFAULT_LOCALE =
  (LOCALE_DEFS.find(l => l.default) || LOCALE_DEFS[0]).code

function hreflangFor(code) {
  return LOCALE_DEFS.find(l => l.code === code)?.language || code
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name)
    return e.isDirectory() ? walk(p) : [p]
  })
}

function fileToLocaleRest(file) {
  const rel = path.relative(CONTENT_DIR, file).replaceAll('\\', '/')
  const noExt = rel.replace(/\.(md|mdc)$/i, '')
  const parts = noExt.split('/').filter(Boolean)
  if (!parts.length) return null

  const locale = parts[0]
  if (!LOCALES.includes(locale)) return null

  let rest = parts.slice(1)

  if (!rest.length || ['home', 'index'].includes(rest[0])) rest = []
  if (rest.at(-1) === 'index') rest.pop()

  return { locale, rest: rest.join('/') }
}

function pathUnprefixed(rest) {
  return rest ? `/${rest}` : '/'
}

function pathPrefixed(locale, rest) {
  return rest ? `/${locale}/${rest}` : `/${locale}`
}

function main() {
  const files = walk(CONTENT_DIR).filter(f => /\.(md|mdc)$/i.test(f))
  const map = new Map()

  for (const f of files) {
    const info = fileToLocaleRest(f)
    if (!info) continue
    if (info.rest === 'blog' || info.rest === 'architecture') continue

    if (!map.has(info.rest)) map.set(info.rest, new Set())
    map.get(info.rest).add(info.locale)
  }

  const urls = []

  for (const [rest, locales] of map.entries()) {
    if (!locales.has(DEFAULT_LOCALE)) continue

    const loc = `${SITE}${pathUnprefixed(rest)}`
    const alternates = [
      { hreflang: 'x-default', href: loc }
    ]

    for (const code of LOCALES) {
      if (!locales.has(code)) continue
      alternates.push({
        hreflang: hreflangFor(code),
        href: `${SITE}${pathPrefixed(code, rest)}`
      })
    }

    urls.push({ loc, alternates })
  }

  urls.sort((a, b) => a.loc.localeCompare(b.loc))

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map(u => `
  <url>
    <loc>${u.loc}</loc>
${u.alternates.map(a =>
    `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`
  ).join('\n')}
  </url>`).join('\n')}
</urlset>
`

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
  fs.writeFileSync(OUT_FILE, xml, 'utf8')
  console.log(`✅ sitemap.xml written (${urls.length} URLs)`)
}

main()
