<template>
  <main>
    <section class="hero is-medium is-light page-hero">
      <div class="hero-body">
        <div class="container content-width">
          <nav v-if="doc" class="breadcrumb is-small mb-4" aria-label="breadcrumbs">
            <ul>
              <li>
                <NuxtLink :to="breadcrumbHomeHref">
                  {{ breadcrumbHomeLabel }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink :to="breadcrumbBlogHref">
                  {{ breadcrumbBlogLabel }}
                </NuxtLink>
              </li>
              <li class="is-active">
                <a aria-current="page">{{ breadcrumbCurrentLabel }}</a>
              </li>
            </ul>
          </nav>

          <h1 class="title is-2 mb-3">
            {{ postTitle }}
          </h1>

          <p v-if="postDescription" class="subtitle is-4 has-text-grey-dark">
            {{ postDescription }}
          </p>
        </div>
      </div>
    </section>

    <div class="section">
      <div class="container content" v-if="doc">
        <ContentRenderer :value="doc" />
      </div>
    </div>
  </main>
</template>

<script setup>
const route = useRoute()
const { locale } = useI18n()

const slug = computed(() => String(route.params.slug || ''))

// 1) Keep your working collection query for the actual doc/body
const { data: doc } = await useAsyncData(
  () => `blog-doc-${locale.value}-${slug.value}`,
  async () => {
    const d = await queryCollection('content')
      .path(`/${locale.value}/blog/${slug.value}`)
      .first()

    if (!d) {
      throw createError({ statusCode: 404, statusMessage: 'Post not found' })
    }

    return d
  },
  { watch: [locale, slug] }
)

// 2) Load raw front-matter (title/description) as a separate fetch.
// This fixes your schema stripping issue without changing schema.
const { data: raw } = await useAsyncData(
  () => `blog-raw-${locale.value}-${slug.value}`,
  async () => {
    // NOTE: this may return null in your setup; that's fine, we fallback.
    try {
      return await queryContent(`/${locale.value}/blog/${slug.value}`).findOne()
    } catch (e) {
      return null
    }
  },
  { watch: [locale, slug] }
)

// Prefer raw front-matter (if available), otherwise fall back to doc/meta/date-only
const postTitle = computed(() => {
  return (
    raw.value?.title ||
    doc.value?.title ||
    doc.value?.meta?.title ||
    slug.value
  )
})

const postDescription = computed(() => {
  return (
    raw.value?.description ||
    doc.value?.description ||
    doc.value?.meta?.description ||
    ''
  )
})

// Breadcrumb (optional keys)
const breadcrumbHomeHref = computed(() => raw.value?.breadcrumbHomeHref || doc.value?.breadcrumbHomeHref || '/')
const breadcrumbHomeLabel = computed(() => raw.value?.breadcrumbHomeLabel || doc.value?.breadcrumbHomeLabel || 'Home')
const breadcrumbBlogHref = computed(() => raw.value?.breadcrumbBlogHref || doc.value?.breadcrumbBlogHref || '/blog')
const breadcrumbBlogLabel = computed(() => raw.value?.breadcrumbBlogLabel || doc.value?.breadcrumbBlogLabel || 'Blog')
const breadcrumbCurrentLabel = computed(() => raw.value?.breadcrumbCurrentLabel || doc.value?.breadcrumbCurrentLabel || postTitle.value)
</script>

<style scoped>
.container {
  max-width: 860px;
}
</style>
