import fs from 'node:fs'
import path from 'node:path'

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true })
}

function copyFileIfExists(src, dst) {
  if (fs.existsSync(src)) fs.copyFileSync(src, dst)
}

function main() {
  const baseURL = process.env.NUXT_APP_BASE_URL || '/'
  const baseFolder = baseURL.replace(/^\/|\/$/g, '') // "blockchange-nuxthub" or ""
  const outRoot = path.resolve(process.cwd(), '.output/public')

  // If baseURL is /blockchange-nuxthub/ Nuxt may output into .output/public/blockchange-nuxthub
  const outDir = baseFolder ? path.join(outRoot, baseFolder) : outRoot

  ensureDir(outDir)

  // GitHub Pages SPA fallback
  const html200 = path.join(outDir, '200.html')
  const indexHtml = path.join(outDir, 'index.html')

  if (fs.existsSync(html200)) {
    fs.copyFileSync(html200, indexHtml)
    console.log(`✅ index.html overwritten from 200.html in ${outDir}`)
  } else if (!fs.existsSync(indexHtml)) {
    console.warn('⚠ 200.html not found and index.html not present — nothing to overwrite')
  }

  // Disable Jekyll processing
  fs.writeFileSync(path.join(outDir, '.nojekyll'), '')
  console.log(`✅ .nojekyll created in ${outDir}`)
}

main()
