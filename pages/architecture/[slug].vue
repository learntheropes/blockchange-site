<template>
  <NuxtLayout>
    <section class="hero is-medium is-light page-hero">
      <div class="hero-body">
        <div class="container content-width">
          <nav class="breadcrumb is-small mb-4" aria-label="breadcrumbs">
            <ul>
              <li>
                <NuxtLink :to="localizedHref(architecture.meta.breadcrumbHomeHref)">
                  {{ architecture.meta.breadcrumbHomeLabel }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink :to="localizedHref(architecture.meta.breadcrumbArchitectureHref)">
                  {{ architecture.meta.breadcrumbArchitectureLabel }}
                </NuxtLink>
              </li>
              <li class="is-active">
                <a aria-current="page">{{ architecture.meta.breadcrumbCurrentLabel }}</a>
              </li>
            </ul>
          </nav>

          <h1 class="title has-text-primary is-2 mb-3">
            {{ architecture.meta.heroHeadline }}
          </h1>

          <p class="subtitle is-4 has-text-grey-dark">
            {{ architecture.meta.heroSubheadline }}
          </p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container content-width">
        <div v-for="(s, i) in architecture.meta.sections" :key="i" class="box shadow-soft section-card">
          <h2 class="title has-text-primary is-4 mb-3">{{ s.title }}</h2>
          <p class="content has-text-grey-dark mb-0">{{ s.text }}</p>
        </div>
      </div>
    </section>

    <section class="section" v-if="otherArchitecture?.length || recommendedPosts?.length">
      <div class="container content-width">
        <div class="box shadow-soft related-box">
          <div class="columns is-variable is-6">
            <div class="column is-6" v-if="otherArchitecture?.length">
              <h3 class="title is-5 mb-3">{{ t('related.architectureTitle') }}</h3>
              <ul class="related-list">
                <li v-for="a in otherArchitecture" :key="a.path">
                  <NuxtLink :to="a.path">{{ a.title }}</NuxtLink>
                </li>
              </ul>
            </div>

            <div class="column is-6" v-if="recommendedPosts?.length">
              <h3 class="title is-5 mb-3">{{ t('related.postsTitle') }}</h3>
              <ul class="related-list">
                <li v-for="p in recommendedPosts" :key="p.path">
                  <NuxtLink :to="p.path">{{ p.title }}</NuxtLink>
                </li>
              </ul>

              <div class="mt-4">
                <NuxtLink :to="{ path: localePath('/'), hash: '#blog' }">
                  {{ t('related.more') }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="cta">
      <div class="container content-width">
        <div class="box cta-box shadow-soft">
          <div class="columns is-vcentered">
            <div class="column is-8">
              <h2 class="title is-4 mb-2">{{ architecture.meta.bookingTitle }}</h2>
              <p class="has-text-grey mb-0">{{ architecture.meta.bookingText }}</p>
            </div>
            <div class="column is-4 has-text-right">
              <o-button variant="primary" size="large" tag="router-link" :to="bookingCtaTo">
                {{ architecture.meta.bookingCtaLabel }}
              </o-button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup>
import { computed } from 'vue'
import { ARCH_PILLARS, getArchRelatedBlogSlugs } from '~/utils/related'

const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()

const { $jsonld } = useNuxtApp()

const slug = computed(() => String(route.params.slug || ''))

function stripLocalePrefix(p = '') {
  const s = String(p).trim()
  const withSlash = s.startsWith('/') ? s : `/${s}`
  return withSlash.replace(/^\/(en|es|ru)(\/|$)/, '/')
}

function localizedHref(href) {
  if (!href || typeof href !== 'string') return href
  if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) return href
  const cleaned = stripLocalePrefix(href)
  return localePath(cleaned)
}

function withQueryBeforeHash(url, params) {
  const [path, hash = ''] = String(url || '').split('#')
  const q = new URLSearchParams()

  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    const s = String(v)
    if (!s.length) return
    q.set(k, s)
  })

  const qs = q.toString()
  return `${path}${qs ? `?${qs}` : ''}${hash ? `#${hash}` : ''}`
}

function stemToSlug(stem = '') {
  const s = String(stem || '')
  const parts = s.split('/')
  return parts[parts.length - 1] || ''
}

function withTrailingSlash(u = '') {
  const s = String(u || '')
  return s.endsWith('/') ? s : `${s}/`
}

const dataKey = computed(() => `arch:${locale.value}:${slug.value}`)

/* Content */
const { data: architecture, error: archError } = await useAsyncData(
  dataKey.value,
  async () => {
    const doc = await queryCollection('content')
      .path(`/${locale.value}/architecture/${slug.value}`)
      .first()

    if (!doc) {
      throw createError({ statusCode: 404, statusMessage: 'Page not found' })
    }

    return doc
  },
  { watch: [locale, slug] }
)

if (archError.value) {
  throw archError.value
}

/* CTA */
const bookingCtaTo = computed(() => {
  const href = architecture.value?.meta?.bookingCtaHref || '/#book'
  const label = architecture.value?.meta?.bookingCtaLabel || ''
  const base = localizedHref(href)

  return withQueryBeforeHash(base, {
    src: route.path,
    cta: label,
  })
})

/* Other architecture pillars */
const { data: otherArchitecture } = await useAsyncData(
  () => `other-arch:${locale.value}:${slug.value}`,
  async () => {
    const docs = await Promise.all(
      ARCH_PILLARS.map(async (s) => {
        const doc = await queryCollection('content')
          .path(`/${locale.value}/architecture/${s}`)
          .first()
        if (!doc) return null
        return {
          path: doc.path,
          title: doc?.meta?.heroHeadline || doc?.title || s,
        }
      })
    )

    const currentPath = architecture.value?.path
    return (docs || []).filter(Boolean).filter(x => x.path !== currentPath)
  },
  { watch: [locale, () => architecture.value?.path] }
)

/* 3 recommended blog posts for this architecture */
const { data: recommendedPosts } = await useAsyncData(
  () => `recommended-posts:${locale.value}:${slug.value}`,
  async () => {
    const archSlug = stemToSlug(architecture.value?.stem)
    const wanted = getArchRelatedBlogSlugs(archSlug, 3)

    const resolved = []
    for (const s of wanted) {
      const doc = await queryCollection('content')
        .path(`/${locale.value}/blog/${s}`)
        .first()

      if (!doc) continue
      resolved.push({
        path: doc.path,
        title: doc.title || s,
      })
    }

    if (resolved.length < 3) {
      const all = await queryCollection('content').limit(400).all()
      const fill = (all || [])
        .filter(x => x?.stem?.startsWith(`${locale.value}/blog/`))
        .map(x => ({
          path: x.path,
          title: x.title,
          date: x.meta?.date,
        }))
        .sort((a, b) => Date.parse(b.date || 0) - Date.parse(a.date || 0))

      for (const item of fill) {
        if (resolved.length >= 3) break
        if (resolved.some(r => r.path === item.path)) continue
        resolved.push({ path: item.path, title: item.title })
      }
    }

    return resolved.slice(0, 3)
  },
  { watch: [locale, () => architecture.value?.path] }
)

useHead(() => {
  const a = architecture.value
  return {
    title: a?.meta?.heroHeadline || 'Architecture',
    meta: [
      { id: 'description', name: 'description', content: a?.meta?.heroSubheadline || '' },
      { id: 'og:title', name: 'og:title', content: a?.meta?.heroHeadline || '' },
      { id: 'og:description', name: 'og:description', content: a?.meta?.heroSubheadline || '' },
    ],
  }
})

/* JSON-LD (WebPage + BreadcrumbList) */
useJsonld(() => {
  const a = architecture.value
  if (!a) return null

  const title = a?.meta?.heroHeadline || a?.title || 'Architecture'
  const description = a?.meta?.heroSubheadline || ''
  const dateModified = a?.meta?.updated || a?.meta?.dateModified || null

  // IMPORTANT: keep as path + trailing slash; plugin makes it absolute using deploymentDomain
  const canonicalUrl = withTrailingSlash(String(a.path || route.path || ''))

  const homeHref = localizedHref(a.meta?.breadcrumbHomeHref || `/${locale.value}/`)
  const archIndexHref = localizedHref(a.meta?.breadcrumbArchitectureHref || `/${locale.value}/#architecture`)
  const currentLabel = a.meta?.breadcrumbCurrentLabel || title

  return $jsonld.graph([
    $jsonld.logo(),
    $jsonld.organization(),
    $jsonld.website('Blockchange', description),

    $jsonld.archWebPage({
      url: canonicalUrl,
      title,
      description,
      dateModified,
    }),

    // IMPORTANT: webpageUrl (not webpageId) => absolute @id in output
    $jsonld.archBreadcrumbs({
      webpageUrl: canonicalUrl,
      items: [
        { name: a.meta?.breadcrumbHomeLabel || 'Home', url: homeHref },
        { name: a.meta?.breadcrumbArchitectureLabel || 'Architecture', url: archIndexHref },
        { name: currentLabel, url: canonicalUrl },
      ],
    }),
  ])
})
</script>

<style scoped>
.content-width {
  max-width: 900px;
}

.page-hero {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.shadow-soft {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}

.section-card {
  margin-bottom: 1.25rem;
}

.cta-box {
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.related-box {
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.related-list {
  margin: 0;
  padding-left: 1.2rem;
}

.related-list li+li {
  margin-top: 0.4rem;
}
</style>
