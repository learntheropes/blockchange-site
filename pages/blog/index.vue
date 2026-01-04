<template>
  <NuxtLayout>
    <section class="hero is-medium is-light page-hero">
      <div class="hero-body">
        <div class="container content-width">
          <nav class="breadcrumb is-small mb-4" aria-label="breadcrumbs">
            <ul>
              <li>
                <NuxtLink :to="posts[0].breadcrumbHomeHref">
                  {{ posts[0].breadcrumbHomeLabel }}
                </NuxtLink>
              </li>
              <li class="is-active">
                <a aria-current="page">{{ posts[0].breadcrumbBlogLabel }}</a>
              </li>
            </ul>
          </nav>
          <h1 class="title has-text-primary is-2 mb-3">Blog & insights</h1>
        </div>
      </div>
    </section>

    <div class="section">
      <div class="container">
        <div class="columns is-multiline is-variable is-6 is-centered">
          <div v-for="post in posts" :key="post.path" class="column is-4">
            <div class="box shadow-soft blog-card">
              <h2 class="title is-5 mb-2">
                {{ post.title }}
              </h2>

              <p class="has-text-grey blog-excerpt">
                {{ post.description }}
              </p>

              <o-button class="mt-4" variant="light" size="small" tag="a" :href="post.path"
                :aria-label="`Read: ${post.title}`">
                Read → <span class="sr-only">{{ post.title }}</span>
              </o-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
const { locale } = useI18n()

useHead({
  title: "Blog & insights",
  meta: [
    {
      id: 'og:title',
      name: 'og:title',
      content: "Blog & insights"
    }
  ],
});

const { data: posts } = await useAsyncData(
  () => `blog-index-${locale.value}`,
  async () => {
    const all = await queryCollection('content').limit(200).all()

    const items = (all || [])
      .filter(x => x?.stem?.startsWith(`${locale.value}/blog/`))
      .map(x => ({
        path: x.path,
        title: x.title,
        description: x.description,
        date: x.meta.date, // expecting ISO: YYYY-MM-DD
        breadcrumbHomeLabel: x.meta.breadcrumbHomeLabel,
        breadcrumbHomeHref: x.meta.breadcrumbHomeHref,
        breadcrumbBlogLabel: x.meta.breadcrumbBlogLabel
      }))

    const toTs = (d) => {
      if (!d) return -Infinity
      const ts = Date.parse(d)
      return Number.isFinite(ts) ? ts : -Infinity
    }

    items.sort((a, b) => toTs(b.date) - toTs(a.date))

    return items
  },
  {
    watch: [locale]
  }
)
</script>

<style scoped>
.container {
  max-width: 1100px;
}

.blog-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.blog-excerpt {
  flex: 1;
  font-size: 1rem;
  line-height: 1.6;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
