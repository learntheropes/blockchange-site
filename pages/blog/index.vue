<template>
  <main class="section">
    <div class="container">
      <h1 class="title is-3 mb-6">Blog & insights</h1>

      <div class="columns is-multiline is-variable is-6 is-centered">
        <div
          v-for="post in posts"
          :key="post.path"
          class="column is-4"
        >
          <div class="box shadow-soft blog-card">
            <h2 class="title is-5 mb-2">
              {{ post.title }}
            </h2>

            <p class="has-text-grey blog-excerpt">
              {{ post.description }}
            </p>

            <o-button
              class="mt-4"
              variant="light"
              size="small"
              tag="a"
              :href="post.path"
            >
              Read →
            </o-button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
const { locale } = useI18n()

const { data: posts } = await useAsyncData(
  () => `blog-index-${locale.value}`,
  async () => {
    const all = await queryCollection('content').limit(500).all()

    const items = (all || [])
      .filter((x) => x?.stem?.startsWith(`${locale.value}/blog/`))
      .map((x) => ({
        path: x.path,
        title: x.title || x.stem?.split('/').pop(),
        description: x.description || '',
        stem: x.stem
      }))

    items.sort((a, b) => (a.stem < b.stem ? 1 : -1))
    return items
  },
  { watch: [locale] }
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
</style>
