import fs from 'node:fs'
import path from 'node:path'

const OUT_FILE = path.resolve(process.cwd(), 'public', 'robots.txt')

// Expected values:
// - public  => allow + sitemap pointing to canonical www
// - app     => disallow everything, no sitemap
const MODE = (process.env.ROBOTS_MODE || 'public').toLowerCase()

// Canonical sitemap URL for SEO site (always www)
const CANONICAL_SITEMAP = 'https://www.blockchange.com.py/sitemap.xml'

function write(txt) {
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
  fs.writeFileSync(OUT_FILE, txt.trim() + '\n', 'utf8')
  console.log(`✅ robots.txt written (${MODE}) -> ${OUT_FILE}`)
}

if (MODE === 'app') {
  write(`
User-agent: *
Disallow: /
`)
} else {
  // public (default)
  write(`
User-agent: *
Allow: /

Sitemap: ${CANONICAL_SITEMAP}
`)
}
