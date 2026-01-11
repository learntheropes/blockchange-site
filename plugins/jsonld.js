import find from 'lodash.find'
import { locales } from '~/assets/js/localization'

export default defineNuxtPlugin((nuxtApp) => {
  const { public: { deploymentDomain, canonicalDomain } } = useRuntimeConfig()
  const { locale } = nuxtApp.$i18n

  // Base domains (no trailing slash)
  const rawDomain = String(deploymentDomain || '').replace(/\/$/, '')
  const rawCanonical = String(canonicalDomain || '').replace(/\/$/, '')

  // Use canonicalDomain if provided, otherwise fallback to deploymentDomain
  const domain = rawCanonical || rawDomain

  // Language must be dynamic (don’t freeze at plugin init)
  function lang() {
    const code = String(locale.value || 'en')
    return (
      find(locales, { code })?.language ||
      code.replace('_', '-') ||
      'en'
    )
  }

  // Minimal helper: make absolute URL + rewrite host to canonical when possible
  function toAbsUrl(u = '') {
    const s = String(u || '').trim()
    if (!s) return s

    // absolute URL
    if (s.startsWith('http://') || s.startsWith('https://')) {
      // if canonicalDomain is set and the URL starts with deploymentDomain, rewrite to canonicalDomain
      if (rawCanonical && rawDomain && s.startsWith(rawDomain)) {
        return rawCanonical + s.slice(rawDomain.length)
      }
      return s
    }

    // relative URL
    return `${domain}${s.startsWith('/') ? s : `/${s}`}`
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

        logo: () => ({
          '@type': 'ImageObject',
          '@id': `${domain}/#logo`,
          url: `${domain}/favicon/favicon.png`,
          contentUrl: `${domain}/favicon/favicon.png`,
          width: 256,
          height: 256
        }),

        organization: () => ({
          '@type': 'Organization',
          '@id': `${domain}/#organization`,
          name: 'Blockchange',
          url: `${domain}/`,
          logo: { '@id': `${domain}/#logo` }
        }),

        website: (_heroHeadline, heroSubheadline) => ({
          '@type': 'WebSite',
          '@id': `${domain}/#website`,
          url: `${domain}/`,
          name: 'Blockchange',
          description: heroSubheadline,
          publisher: { '@id': `${domain}/#organization` },
          inLanguage: lang()
        }),

        indexWebPage: (heroHeadline, heroSubheadline) => ({
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
        }),

        indexArchitecturesItemList: (pillars) => ({
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
        }),

        indexBlogPostsItemList: (allPosts) => ({
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
        }),

        blogWebPage: ({ url, title, description }) => {
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
              .map((item, i) => {
                const abs = toAbsUrl(item.url)
                return {
                  '@type': 'ListItem',
                  position: i + 1,
                  name: item.name,
                  item: withTrailingSlashIfNoHash(abs)
                }
              }),
            inLanguage: lang()
          }
        },

        blogPosting: ({ url, title, description, datePublished, dateModified }) => {
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

          Object.keys(out).forEach((k) => out[k] === undefined && delete out[k])
          return out
        },

        archWebPage: ({ url, title, description, dateModified }) => {
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

          Object.keys(out).forEach((k) => out[k] === undefined && delete out[k])
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
              .map((item, i) => {
                const abs = toAbsUrl(item.url)
                return {
                  '@type': 'ListItem',
                  position: i + 1,
                  name: item.name,
                  item: withTrailingSlashIfNoHash(abs)
                }
              }),
            inLanguage: lang()
          }
        },
      }
    }
  }
})
