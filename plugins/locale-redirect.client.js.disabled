import localization from '~/assets/js/localization.data.json'

export default defineNuxtPlugin(() => {
  const router = useRouter()

  const localeDefs = Array.isArray(localization?.locales) ? localization.locales : []

  const localeCodes = localeDefs
    .map(l => String(l?.code || '').trim())
    .filter(Boolean)

  const localeSet = new Set(localeCodes)

  const defaultLocale =
    String(localeDefs.find(l => l?.default)?.code || '').trim() ||
    String(localeCodes[0] || 'en')

  // Build matching candidates per locale:
  // - exact language tags: es-419, en, ru
  // - base tags: es, en, ru
  // - code itself: es, en, ru
  const localeMatchers = localeDefs.map(l => {
    const code = String(l?.code || '').toLowerCase()
    const lang = String(l?.language || '').toLowerCase()
    const langBase = lang.split('-')[0]

    const tags = new Set()
    if (code) tags.add(code)
    if (lang) tags.add(lang)
    if (langBase) tags.add(langBase)

    return { code: String(l?.code || '').trim(), tags }
  })

  const hasLocalePrefix = (path = '') => {
    const p = String(path || '')
    const seg = p.split('/')[1] || ''
    return localeSet.has(seg)
  }

  // Adds trailing slash to paths (not query/hash), unless:
  // - already ends with /
  // - looks like a file (/foo.xml, /bar.png, etc.)
  const ensureTrailingSlashPath = (path = '') => {
    const p = String(path || '')
    if (!p) return p
    if (p.endsWith('/')) return p
    if (/\.[a-z0-9]+$/i.test(p)) return p // file extension
    return `${p}/`
  }

  const pickBestLocale = () => {
    // SSR-safe: always fallback to default locale
    if (typeof navigator === 'undefined') return defaultLocale

    const langs = (navigator.languages && navigator.languages.length)
      ? navigator.languages
      : [navigator.language || defaultLocale]

    for (const raw of langs) {
      const tag = String(raw || '').toLowerCase()
      if (!tag) continue
      const base = tag.split('-')[0]

      for (const m of localeMatchers) {
        if (m.tags.has(tag) || (base && m.tags.has(base))) {
          return m.code
        }
      }
    }

    // If no match, redirect to the locale with `"default": true`
    return defaultLocale
  }

  router.beforeEach((to) => {
    // already localized -> do nothing
    if (hasLocalePrefix(to.path)) return

    // ignore API (in case)
    if (to.path.startsWith('/api/')) return

    // only redirect specific non-localized sections + root
    const isRoot = to.path === '/'
    const isBlog = to.path === '/blog' || to.path.startsWith('/blog/')
    const isArchitecture = to.path === '/architecture' || to.path.startsWith('/architecture/')

    if (!isRoot && !isBlog && !isArchitecture) return

    const targetLocale = pickBestLocale()

    // Build target path with trailing slash consistency
    let targetPath = isRoot
      ? `/${targetLocale}/` // IMPORTANT: keep trailing slash
      : `/${targetLocale}${to.path}`

    // normalize to trailing slash (except file-like paths)
    targetPath = ensureTrailingSlashPath(targetPath)

    return {
      path: targetPath,
      query: to.query,
      hash: to.hash,
      replace: true,
    }
  })
})
