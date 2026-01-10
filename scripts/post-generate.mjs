// scripts/post-generate.mjs
import fs from 'node:fs'
import path from 'node:path'

function exists(p) {
  try {
    fs.accessSync(p)
    return true
  } catch {
    return false
  }
}

// Nuxt output for your build is nested because baseURL is /blockchange-nuxthub/
const ROOT = path.resolve(process.cwd(), '.output', 'public')
const NESTED = path.join(ROOT, 'blockchange-nuxthub')

// Use nested if it exists, otherwise fallback to root
const OUT = exists(NESTED) ? NESTED : ROOT

// Ensure .nojekyll exists in the folder that GitHub Pages actually serves
fs.writeFileSync(path.join(OUT, '.nojekyll'), '')
console.log(`✅ .nojekyll created in ${OUT}`)

// OPTIONAL: SPA fallback (only if you really want it)
// If 200.html exists, copy to index.html
const html200 = path.join(OUT, '200.html')
const indexHtml = path.join(OUT, 'index.html')

if (exists(html200)) {
  fs.copyFileSync(html200, indexHtml)
  console.log('✅ index.html overwritten from 200.html')
} else {
  console.log('ℹ️ 200.html not found, leaving index.html as generated')
}
