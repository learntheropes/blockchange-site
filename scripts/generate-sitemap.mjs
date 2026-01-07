import fs from 'node:fs'
import path from 'node:path'

const SITE = 'https://blockchange.com.py'

// Adjust to your real content folder structure
const CONTENT_DIR = path.resolve(process.cwd(), 'content')
const OUT_FILE = path.resolve(process.cwd(), 'public', 'sitemap.xml')

// If your content is only in /content/en/... right now:
const LOCALES = ['en']

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

function fileToRoute(file) {
  // Examples:
  // content/en/home.md -> /en
  // content/en/blog/foo.md -> /en/blog/foo
  const rel = path.relative(CONTENT_DIR, file).replaceAll('\\', '/')
  const noExt = rel.replace(/\.(md|mdc)$/i, '')
  const parts = noExt.split('/').filter(Boolean)

  if (!parts.length) return null

  const locale = parts[0]
  if (!LOCALES.includes(locale)) return null

  let rest = parts.slice(1)

  // home/index -> locale root
  if (rest.length === 0) return `/${locale}`
  if (rest.length === 1 && ['home', 'index'].includes(rest[0].toLowerCase())) return `/${locale}`

  // drop trailing index
  if (rest[rest.length - 1]?.toLowerCase() === 'index') rest = rest.slice(0, -1)

  return `/${locale}/${rest.join('/')}`
}

function urlNode(loc) {
  return `  <url><loc>${escapeXml(loc)}</loc></url>`
}

function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`Missing content dir: ${CONTENT_DIR}`)
    process.exit(1)
  }

  const files = walk(CONTENT_DIR).filter(f => /\.(md|mdc)$/i.test(f))
  const urls = new Set()

  // Always include these
  urls.add(`${SITE}/`)
  for (const l of LOCALES) {
    urls.add(`${SITE}/${l}`)
    urls.add(`${SITE}/${l}/blog`)
    urls.add(`${SITE}/${l}/architecture`)
  }

  // Add pages from content
  for (const f of files) {
    const route = fileToRoute(f)
    if (!route) continue
    urls.add(`${SITE}${route}`)
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from(urls).sort().map(urlNode).join('\n')}
</urlset>
`

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
  fs.writeFileSync(OUT_FILE, xml, 'utf8')
  console.log(`✅ Wrote ${OUT_FILE} with ${urls.size} URLs`)
}

main()
