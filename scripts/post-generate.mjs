import fs from 'node:fs'
import path from 'node:path'

const out = path.resolve('.output/public')

const from = path.join(out, '200.html')
const to = path.join(out, 'index.html')
const nojekyll = path.join(out, '.nojekyll')

if (!fs.existsSync(out)) {
  console.error('❌ .output/public not found')
  process.exit(1)
}

if (fs.existsSync(from)) {
  fs.copyFileSync(from, to)
  console.log('✅ index.html created from 200.html')
} else {
  console.warn('⚠ 200.html not found, index.html not created')
}

if (!fs.existsSync(nojekyll)) {
  fs.writeFileSync(nojekyll, '')
  console.log('✅ .nojekyll created')
}
