<template>
  <NuxtLayout>
    <section class="hero is-medium is-light page-hero">
      <div class="hero-body">
        <div class="container content-width">
          <nav class="breadcrumb is-small mb-4" aria-label="breadcrumbs">
            <ul>
              <li>
                <NuxtLink :to="localePath(post.meta.breadcrumbHomeHref)">
                  {{ post.meta.breadcrumbHomeLabel }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink :to="localePath(post.meta.breadcrumbBlogHref)">
                  {{ post.meta.breadcrumbBlogLabel }}
                </NuxtLink>
              </li>
              <li class="is-active">
                <a aria-current="page">{{ post.meta.breadcrumbCurrentLabel }}</a>
              </li>
            </ul>
          </nav>

          <h1 class="title has-text-primary is-2 mb-3">
            {{ post.title }}
          </h1>
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

const route = useRoute()
const { locale } = useI18n()
const localePath = useLocalePath()

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

const bookingCtaTo = computed(() => {
  const href = post.value?.meta?.bookingCtaHref || '/#book'
  const label = post.value?.meta?.bookingCtaLabel || ''
  const base = localePath(href)

  // Canonical: /{locale}?src=<current-path>&cta=<label>#book
  return withQueryBeforeHash(base, {
    src: route.path,
    cta: label,
  })
})

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
</style>
