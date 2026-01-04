<template>
  <main>
    <section class="hero is-medium is-light page-hero">
      <div class="hero-body">
        <div class="container content-width">
          <nav class="breadcrumb is-small mb-4" aria-label="breadcrumbs">
            <ul>
              <li>
                <NuxtLink :to="post.meta.breadcrumbHomeHref">
                  {{ post.meta.breadcrumbHomeLabel }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink :to="post.meta.breadcrumbBlogHref">
                  {{ post.meta.breadcrumbBlogLabel }}
                </NuxtLink>
              </li>
              <li class="is-active">
                <a aria-current="page">{{ post.meta.breadcrumbCurrentLabel }}</a>
              </li>
            </ul>
          </nav>
          <h1 class="title is-2 mb-3">
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
  </main>
</template>

<script setup>
const route = useRoute()
const { locale } = useI18n()
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
</script>

<style scoped>
.container {
  max-width: 860px;
}
</style>
