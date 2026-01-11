import find from 'lodash.find'
import { locales } from '~/assets/js/localization'

export default defineNuxtPlugin((nuxtApp) => {
  const { public: { deploymentDomain, canonicalDomain } } = useRuntimeConfig()
  const { locale } = nuxtApp.$i18n

  function stripTrailingSlash(u = '') {
    return String(u || '').replace(/\/$/, '')
  }

  // IMPORTANT: domain is dynamic (never frozen at init)
  function getDomain() {
    const canon = stripTrailingSlash(canonicalDomain)
    if (canon) return canon

    const dep = stripTrailingSlash(deploymentDomain)
    if (dep) return dep

    // Client fallback (works for SSG too)
    if (process.client && typeof window !== 'undefined' && window.location?.origin) {
      return stripTrailingSlash(window.location.origin)
    }

    // Server fallback (behind proxies)
    try {
      const h = useRequestHeaders([
        'x-forwarded-host',
        'x-forwarded-proto',
        'host'
      ])

      const proto =
        String(h['x-forwarded-proto'] || '').split(',')[0].trim() ||
        'https'

      const host =
        String(h['x-forwarded-host'] || '').split(',')[0].trim() ||
        String(h['host'] || '').trim()

      if (host) return `${proto}://${host}`
    } catch (e) { }

    // Last resort: keep empty (better than localhost)
    return ''
  }

  function lang() {
    const code = String(locale.value || 'en')
    return (
      find(locales, { code })?.language ||
      code.replace('_', '-') ||
      'en'
    )
  }

  function toAbsUrl(u = '') {
    const s = String(u || '').trim()
    if (!s) return s

    // already absolute
    if (s.startsWith('http://') || s.startsWith('https://')) {
      // if canonicalDomain is set, rewrite to it (host-only)
      const canon = stripTrailingSlash(canonicalDomain)
      if (!canon) return s

      // Replace only when it matches deploymentDomain OR current origin
      const dep = stripTrailingSlash(deploymentDomain)
      if (dep && s.startsWith(dep)) return canon + s.slice(dep.length)

      if (process.client && typeof window !== 'undefined' && window.location?.origin) {
        const origin = stripTrailingSlash(window.location.origin)
        if (origin && s.startsWith(origin)) return canon + s.slice(origin.length)
      }

      return s
    }

    const base = getDomain()
    if (!base) return s.startsWith('/') ? s : `/${s}`
    return `${base}${s.startsWith('/') ? s : `/${s}`}`
  }

  function withTrailingSlashIfNoHash(u = '') {
    const s = String(u || '')
    if (!s) return s
    if (s.includes('#')) {
      const [base, hash] = s.split('#')
      const base2 = base.endsWith('/') ? base : `${base}/`
      return `${base2}#${hash}`
    }
    return s.endsWith('/') ? s : `${s}/`
  }

  return {
    provide: {
      jsonld: {
        graph: (nodes = []) => ({
          '@context': 'https://schema.org',
          '@graph': nodes
        }),

        logo: () => {
          const domain = getDomain()
          return {
            '@type': 'ImageObject',
            '@id': `${domain}/#logo`,
            url: `${domain}/favicon/favicon.png`,
            contentUrl: `${domain}/favicon/favicon.png`,
            width: 256,
            height: 256
          }
        },

        organization: () => {
          const domain = getDomain()
          return {
            '@type': 'Organization',
            '@id': `${domain}/#organization`,
            name: 'Blockchange',
            url: `${domain}/`,
            logo: { '@id': `${domain}/#logo` }
          }
        },

        website: (_heroHeadline, heroSubheadline) => {
          const domain = getDomain()
          return {
            '@type': 'WebSite',
            '@id': `${domain}/#website`,
            url: `${domain}/`,
            name: 'Blockchange',
            description: heroSubheadline,
            publisher: { '@id': `${domain}/#organization` },
            inLanguage: lang()
          }
        },

        indexWebPage: (heroHeadline, heroSubheadline) => {
          const domain = getDomain()
          return {
            '@type': 'WebPage',
            '@id': `${domain}/${locale.value}/#webpage`,
            url: `${domain}/${locale.value}/`,
            name: 'Homepage',
            headline: heroHeadline,
            description: heroSubheadline,
            isPartOf: { '@id': `${domain}/#website` },
            publisher: { '@id': `${domain}/#organization` },
            inLanguage: lang(),
            mainEntity: [
              { '@id': `${domain}/${locale.value}/#explanation` },
              { '@id': `${domain}/${locale.value}/#blog` }
            ]
          }
        },

        indexArchitecturesItemList: (pillars) => {
          const domain = getDomain()
          return {
            '@type': 'Collection',
            '@id': `${domain}/${locale.value}/#explanation`,
            url: `${domain}/${locale.value}/#explanation`,
            name: 'Architectures collection',
            collectionSize: pillars.length,
            isPartOf: { '@id': `${domain}/${locale.value}/#webpage` },
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: pillars.length,
              itemListElement: pillars.map((item, index) => {
                const href = String(item.href || '').replace(/^\/+/, '')
                return {
                  '@type': 'ListItem',
                  position: index + 1,
                  name: item.title,
                  url: `${domain}/${locale.value}/${href}/`
                }
              })
            },
            inLanguage: lang()
          }
        },

        indexBlogPostsItemList: (allPosts) => {
          const domain = getDomain()
          return {
            '@type': 'Collection',
            '@id': `${domain}/${locale.value}/#blog`,
            url: `${domain}/${locale.value}/#blog`,
            name: 'Blog posts collection',
            collectionSize: allPosts.length,
            isPartOf: { '@id': `${domain}/${locale.value}/#webpage` },
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: allPosts.length,
              itemListElement: allPosts.map((item, index) => {
                const path = String(item.path || '').replace(/^\/+/, '')
                return {
                  '@type': 'ListItem',
                  position: index + 1,
                  name: item.title,
                  url: `${domain}/${path}/`
                }
              })
            },
            inLanguage: lang()
          }
        },

        blogWebPage: ({ url, title, description }) => {
          const domain = getDomain()
          const pageUrl = toAbsUrl(url)
          return {
            '@type': 'WebPage',
            '@id': `${pageUrl}#webpage`,
            url: pageUrl,
            name: title || 'Blog post',
            description,
            isPartOf: { '@id': `${domain}/#website` },
            publisher: { '@id': `${domain}/#organization` },
            inLanguage: lang()
          }
        },

        blogBreadcrumbs: ({ webpageUrl, items = [] }) => {
          const pageUrl = toAbsUrl(webpageUrl)
          const list = Array.isArray(items) ? items : []
          return {
            '@type': 'BreadcrumbList',
            '@id': `${pageUrl}#breadcrumbs`,
            itemListElement: list
              .filter(x => x?.name && x?.url)
              .map((item, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: item.name,
                item: withTrailingSlashIfNoHash(toAbsUrl(item.url))
              })),
            inLanguage: lang()
          }
        },

        blogPosting: ({ url, title, description, datePublished, dateModified }) => {
          const domain = getDomain()
          const pageUrl = toAbsUrl(url)

          const out = {
            '@type': 'BlogPosting',
            '@id': `${pageUrl}#blogposting`,
            mainEntityOfPage: { '@id': `${pageUrl}#webpage` },
            headline: title,
            description,
            datePublished: datePublished || undefined,
            dateModified: dateModified || undefined,
            author: { '@id': `${domain}/#organization` },
            publisher: { '@id': `${domain}/#organization` },
            isPartOf: { '@id': `${domain}/#website` },
            inLanguage: lang()
          }

          Object.keys(out).forEach(k => out[k] === undefined && delete out[k])
          return out
        },

        archWebPage: ({ url, title, description, dateModified }) => {
          const domain = getDomain()
          const pageUrl = toAbsUrl(url)

          const out = {
            '@type': 'WebPage',
            '@id': `${pageUrl}#webpage`,
            url: pageUrl,
            name: title || 'Architecture',
            headline: title || undefined,
            description,
            isPartOf: { '@id': `${domain}/#website` },
            publisher: { '@id': `${domain}/#organization` },
            inLanguage: lang(),
            dateModified: dateModified || undefined
          }

          Object.keys(out).forEach(k => out[k] === undefined && delete out[k])
          return out
        },

        archBreadcrumbs: ({ webpageUrl, items = [] }) => {
          const pageUrl = toAbsUrl(webpageUrl)
          const list = Array.isArray(items) ? items : []

          return {
            '@type': 'BreadcrumbList',
            '@id': `${pageUrl}#breadcrumbs`,
            itemListElement: list
              .filter(x => x?.name && x?.url)
              .map((item, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: item.name,
                item: withTrailingSlashIfNoHash(toAbsUrl(item.url))
              })),
            inLanguage: lang()
          }
        }
      }
    }
  }
})
