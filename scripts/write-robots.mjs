import fs from 'node:fs'
import path from 'node:path'

const mode = (process.env.ROBOTS_MODE || 'public').toLowerCase()

// Decide if indexing is allowed
const allowIndexing = mode === 'public'

// Choose the sitemap URL based on deployment target
// IMPORTANT: for public site use WWW as canonical
const sitemapUrl =
  process.env.NUXT_PUBLIC_SITE_URL
    ? `${process.env.NUXT_PUBLIC_SITE_URL.replace(/\/$/, '')}/sitemap.xml`
    : 'https://www.blockchange.com.py/sitemap.xml'

const content = allowIndexing
  ? `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
`
  : `User-agent: *
Disallow: /

# Block indexing of this deployment
`

function writeFile(targetPath) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true })
  fs.writeFileSync(targetPath, content, 'utf8')
  console.log(`✅ robots.txt written: ${targetPath}`)
}

const rootPublic = path.resolve(process.cwd(), 'public', 'robots.txt')
writeFile(rootPublic)

// Optional: also write into build output if it exists already
const outPublicDir = path.resolve(process.cwd(), '.output', 'public')
if (fs.existsSync(outPublicDir)) {
  writeFile(path.join(outPublicDir, 'robots.txt'))
} else {
  console.log('ℹ️ .output/public not present (normal before generate/build)')
}

console.log(`ℹ️ ROBOTS_MODE=${mode} allowIndexing=${allowIndexing}`)
console.log(`ℹ️ Sitemap: ${sitemapUrl}`)
