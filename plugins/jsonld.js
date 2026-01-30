import find from 'lodash.find'
import { locales } from '~/assets/js/localization'

export default defineNuxtPlugin((nuxtApp) => {
  const { public: { websiteUrl } } = useRuntimeConfig()
  const { locale } = nuxtApp.$i18n

  // Must be like: https://www.blockchange.com.py (no trailing slash)
  const site = String(websiteUrl || '').replace(/\/+$/, '')

  function inLanguage() {
    const code = String(locale.value || 'en')
    return find(locales, { code })?.language || code.replace('_', '-') || 'en'
  }

  /**
   * Ensures URLs end with a trailing slash.
   * If a hash is present, the slash is added BEFORE the hash.
   *
   * /es#blog   -> /es/#blog
   * /foo       -> /foo/
   */
  function ensureTrailingSlash(url = '') {
    const s = String(url || '')
    if (!s) return s

    if (s.includes('#')) {
      const [path, hash] = s.split('#')
      return `${path.endsWith('/') ? path : `${path}/`}#${hash}`
    }

    return s.endsWith('/') ? s : `${s}/`
  }

  /**
   * Converts a relative path to an absolute URL
   * using the configured canonical websiteUrl.
   *
   * /es/blog/foo -> https://www.blockchange.com.py/es/blog/foo
   */
  function toAbsoluteUrl(path = '') {
    const p = String(path || '')
    if (!p) return site
    if (p.startsWith('http://') || p.startsWith('https://')) return p
    return `${site}${p.startsWith('/') ? p : `/${p}`}`
  }

  function cleanUndefined(obj) {
    const out = { ...obj }
    Object.keys(out).forEach(k => out[k] === undefined && delete out[k])
    return out
  }

  return {
    provide: {
      jsonld: {
        graph: (nodes = []) => ({
          '@context': 'https://schema.org',
          '@graph': nodes
        }),

        logo: () => ({
          '@type': 'ImageObject',
          '@id': `${site}/#logo`,
          url: `${site}/favicon/favicon.png`,
          contentUrl: `${site}/favicon/favicon.png`,
          width: 256,
          height: 256
        }),

        organization: () => ({
          '@type': 'Organization',
          '@id': `${site}/#organization`,
          name: 'Blockchange',
          url: `${site}/`,
          logo: { '@id': `${site}/#logo` }
        }),

        /**
         * IMPORTANT:
         * Keep #website stable across pages/locales (same @id).
         * So do NOT set locale-specific description/inLanguage here.
         * Put those on WebPage / BlogPosting instead.
         */
        website: () => ({
          '@type': 'WebSite',
          '@id': `${site}/#website`,
          url: `${site}/`,
          name: 'Blockchange',
          publisher: { '@id': `${site}/#organization` }
        }),

        /**
         * Generic section container for the homepage.
         * This replaces the previous "Collection mainEntity" approach.
         */
        indexSection: ({ id, name }) => {
          const pageUrl = `${site}/${locale.value}/`
          return {
            '@type': 'WebPageElement',
            '@id': `${pageUrl}#${id}`,
            url: `${pageUrl}#${id}`,
            name,
            isPartOf: { '@id': `${pageUrl}#webpage` },
            inLanguage: inLanguage()
          }
        },

        /**
         * Homepage WebPage node (now uses hasPart instead of mainEntity).
         */
        indexWebPage: (heroHeadline, heroSubheadline) => {
          const pageUrl = `${site}/${locale.value}/`

          return {
            '@type': 'WebPage',
            '@id': `${pageUrl}#webpage`,
            url: pageUrl,
            name: 'Homepage',
            headline: heroHeadline,
            description: heroSubheadline,
            isPartOf: { '@id': `${site}/#website` },
            publisher: { '@id': `${site}/#organization` },
            inLanguage: inLanguage(),
            hasPart: [
              { '@id': `${pageUrl}#explanation` },
              { '@id': `${pageUrl}#blog` }
            ]
          }
        },

        /**
         * Homepage breadcrumbs (optional but recommended).
         * Single item: Home.
         */
        indexBreadcrumbs: ({ homeLabel = 'Home', homePath }) => {
          const base = ensureTrailingSlash(toAbsoluteUrl(homePath || `/${locale.value}/`))
          return {
            '@type': 'BreadcrumbList',
            '@id': `${base}#breadcrumbs`,
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: homeLabel,
                item: base
              }
            ],
            inLanguage: inLanguage()
          }
        },

        blogWebPage: ({ url, title, description }) => {
          const pageUrl = ensureTrailingSlash(toAbsoluteUrl(url))
          return {
            '@type': 'WebPage',
            '@id': `${pageUrl}#webpage`,
            url: pageUrl,
            name: title || 'Blog post',
            description,
            isPartOf: { '@id': `${site}/#website` },
            publisher: { '@id': `${site}/#organization` },
            inLanguage: inLanguage()
          }
        },

        blogBreadcrumbs: ({ webpageUrl, items = [] }) => {
          const pageUrl = ensureTrailingSlash(toAbsoluteUrl(webpageUrl))
          return {
            '@type': 'BreadcrumbList',
            '@id': `${pageUrl}#breadcrumbs`,
            itemListElement: items
              .filter(x => x?.name && x?.url)
              .map((item, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: item.name,
                item: ensureTrailingSlash(toAbsoluteUrl(item.url))
              })),
            inLanguage: inLanguage()
          }
        },

        /**
         * BlogPosting now includes url (recommended).
         * No image included (as requested).
         */
        blogPosting: ({ url, title, description, datePublished, dateModified }) => {
          const pageUrl = ensureTrailingSlash(toAbsoluteUrl(url))
          return cleanUndefined({
            '@type': 'BlogPosting',
            '@id': `${pageUrl}#blogposting`,
            url: pageUrl,
            mainEntityOfPage: { '@id': `${pageUrl}#webpage` },
            headline: title,
            description,
            datePublished: datePublished || undefined,
            dateModified: dateModified || undefined,
            author: { '@id': `${site}/#organization` },
            publisher: { '@id': `${site}/#organization` },
            isPartOf: { '@id': `${site}/#website` },
            inLanguage: inLanguage(),
            image: {
              '@type': 'ImageObject', url: `${websiteUrl}/favicon/favicon.png`, width: 1024, height: 1024
            },
          })
        },

        archWebPage: ({ url, title, description, dateModified }) => {
          const pageUrl = ensureTrailingSlash(toAbsoluteUrl(url))

          return cleanUndefined({
            '@type': 'WebPage',
            '@id': `${pageUrl}#webpage`,
            url: pageUrl,
            name: title || 'Architecture',
            headline: title || undefined,
            description,
            isPartOf: { '@id': `${site}/#website` },
            publisher: { '@id': `${site}/#organization` },
            inLanguage: inLanguage(),
            dateModified: dateModified || undefined
          })
        },

        archBreadcrumbs: ({ webpageUrl, items = [] }) => {
          const pageUrl = ensureTrailingSlash(toAbsoluteUrl(webpageUrl))
          return {
            '@type': 'BreadcrumbList',
            '@id': `${pageUrl}#breadcrumbs`,
            itemListElement: items
              .filter(x => x?.name && x?.url)
              .map((item, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: item.name,
                item: ensureTrailingSlash(toAbsoluteUrl(item.url))
              })),
            inLanguage: inLanguage()
          }
        }
      }
    }
  }
})
