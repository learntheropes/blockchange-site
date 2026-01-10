export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()

  const pickBestLocale = () => {
    const langs = (navigator.languages && navigator.languages.length)
      ? navigator.languages
      : [navigator.language || 'en']

    const first = String(langs[0] || 'en').toLowerCase()
    if (first.startsWith('es')) return 'es'
    if (first.startsWith('ru')) return 'ru'
    return 'en'
  }

  const hasLocalePrefix = (path) => /^\/(en|es|ru)(\/|$)/.test(path)

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
    return {
      path: `/${targetLocale}${to.path === '/' ? '' : to.path}`,
      query: to.query,
      hash: to.hash,
      replace: true,
    }
  })
})
