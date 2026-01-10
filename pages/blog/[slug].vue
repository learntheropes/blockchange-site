<template>
  <NuxtLayout>
    <section class="hero is-medium is-light page-hero">
      <div class="hero-body">
        <div class="container content-width">
          <nav class="breadcrumb is-small mb-4" aria-label="breadcrumbs">
            <ul>
              <li>
                <NuxtLink :to="localizedHref(post.meta.breadcrumbHomeHref)">
                  {{ post.meta.breadcrumbHomeLabel }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink :to="localizedHref(post.meta.breadcrumbBlogHref)">
                  {{ post.meta.breadcrumbBlogLabel }}
                </NuxtLink>
              </li>
              <li class="is-active">
                <a aria-current="page">{{ post.meta.breadcrumbCurrentLabel }}</a>
              </li>
            </ul>
          </nav>

          <h1 class="title has-text-primary is-2 mb-3">{{ post.title }}</h1>
          <p v-if="post.description" class="subtitle is-4 has-text-grey-dark">
            {{ post.description }}
          </p>
        </div>
      </div>
    </section>

    <div class="section">
      <div class="container content" v-if="post">
        <ContentRenderer :value="post" />
      </div>
    </div>

    <section class="section" v-if="relatedArchitecture?.length || relatedPosts?.length">
      <div class="container content-width">
        <div class="box shadow-soft related-box">
          <div class="columns is-variable is-6">
            <div class="column is-6" v-if="relatedArchitecture?.length">
              <h3 class="title is-5 mb-3">{{ t('related.architectureTitle') }}</h3>
              <ul class="related-list">
                <li v-for="a in relatedArchitecture" :key="a.path">
                  <NuxtLink :to="a.path">{{ a.title }}</NuxtLink>
                </li>
              </ul>
            </div>

            <div class="column is-6" v-if="relatedPosts?.length">
              <h3 class="title is-5 mb-3">{{ t('related.postsTitle') }}</h3>
              <ul class="related-list">
                <li v-for="p in relatedPosts" :key="p.path">
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
              <h2 class="title is-4 mb-2">{{ post.meta.bookingTitle }}</h2>
              <p class="has-text-grey mb-0">{{ post.meta.bookingText }}</p>
            </div>
            <div class="column is-4 has-text-right">
              <o-button variant="primary" size="large" tag="router-link" :to="bookingCtaTo">
                {{ post.meta.bookingCtaLabel }}
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
import { ARCH_PILLARS, getBlogRelatedSlugs } from '~/utils/related'

const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()

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

/* Content */
const slug = route.params.slug
const key = computed(() => `${route.path}-${locale.value}`)

const { data: post } = await useAsyncData(
  key.value + '-blog-post',
  () =>
    queryCollection('content')
      .path(`/${locale.value}/blog/${slug}`)
      .first(),
  { watch: [locale, () => route.path] }
)

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

/* CTA */
const bookingCtaTo = computed(() => {
  const href = post.value?.meta?.bookingCtaHref || '/#book'
  const label = post.value?.meta?.bookingCtaLabel || ''
  const base = localizedHref(href)

  return withQueryBeforeHash(base, {
    src: route.path,
    cta: label,
  })
})

/* Related architecture */
const { data: relatedArchitecture } = await useAsyncData(
  key.value + '-related-architecture',
  async () => {
    const docs = await Promise.all(
      ARCH_PILLARS.map(async (s) => {
        const doc = await queryCollection('content').path(`/${locale.value}/architecture/${s}`).first()
        if (!doc) return null
        return { path: doc.path, title: doc?.meta?.heroHeadline || doc?.title || s }
      })
    )
    return (docs || []).filter(Boolean)
  },
  { watch: [locale] }
)

/* Related posts */
const { data: relatedPosts } = await useAsyncData(
  key.value + '-related-posts',
  async () => {
    const currentSlug = stemToSlug(post.value?.stem)
    const wanted = getBlogRelatedSlugs(currentSlug, 3)

    const resolved = []
    for (const s of wanted) {
      const doc = await queryCollection('content').path(`/${locale.value}/blog/${s}`).first()
      if (!doc) continue
      resolved.push({ path: doc.path, title: doc.title || s })
    }

    if (resolved.length < 3) {
      const all = await queryCollection('content').limit(400).all()
      const fill = (all || [])
        .filter(x => x?.stem?.startsWith(`${locale.value}/blog/`))
        .filter(x => x?.path !== post.value?.path)
        .map(x => ({ path: x.path, title: x.title, date: x.meta?.date }))
        .sort((a, b) => Date.parse(b.date || 0) - Date.parse(a.date || 0))

      for (const item of fill) {
        if (resolved.length >= 3) break
        if (resolved.some(r => r.path === item.path)) continue
        resolved.push({ path: item.path, title: item.title })
      }
    }

    return resolved.slice(0, 3)
  },
  { watch: [locale, () => post.value?.path] }
)

useHead(() => {
  const p = post.value
  return {
    title: p?.title || 'Blog',
    meta: [
      { id: 'description', name: 'description', content: p?.description || '' },
      { id: 'og:title', name: 'og:title', content: p?.title || '' },
      { id: 'og:description', name: 'og:description', content: p?.description || '' },
    ],
  }
})
</script>

<style scoped>
.container {
  max-width: 860px;
}

.shadow-soft {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
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
