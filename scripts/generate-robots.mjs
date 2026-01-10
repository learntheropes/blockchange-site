import fs from 'node:fs'
import path from 'node:path'

function normalize(url) {
  return String(url || '').trim().replace(/\/+$/, '')
}

// If you set NUXT_PUBLIC_SITE_URL correctly per environment, this “just works”
const rawSite = normalize(process.env.NUXT_PUBLIC_SITE_URL)

// Force www canonical when the public site is the main domain
const site =
  rawSite === 'https://blockchange.com.py'
    ? 'https://www.blockchange.com.py'
    : rawSite

// Decide robots mode:
// - Explicit ROBOTS_MODE wins
// - Otherwise, if site is app.* -> app mode
// - Else -> public mode
const mode =
  (process.env.ROBOTS_MODE || '').toLowerCase() ||
  (site.includes('://app.') ? 'app' : 'public')

function robotsText() {
  // app/private: disallow everything
  if (mode === 'app' || mode === 'private' || mode === 'noindex') {
    return ['User-agent: *', 'Disallow: /', ''].join('\n')
  }

  // public: allow + sitemap on WWW canonical
  const canonical =
    site === 'https://blockchange.com.py' ? 'https://www.blockchange.com.py' : site

  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${canonical}/sitemap.xml`,
    ''
  ].join('\n')
}

const outFile = path.resolve(process.cwd(), 'public', 'robots.txt')
fs.mkdirSync(path.dirname(outFile), { recursive: true })
fs.writeFileSync(outFile, robotsText(), 'utf8')

console.log(`✅ robots.txt written -> ${outFile}`)
console.log(`   mode=${mode}`)
console.log(`   site=${site}`)
