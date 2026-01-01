<template>
  <main class="section">
    <div class="container content" v-if="doc">
      <ContentRenderer :value="doc" />
    </div>
  </main>
</template>

<script setup>
const route = useRoute()
const { locale } = useI18n()

const { data: doc } = await useAsyncData(
  () => `blog-${locale.value}-${route.params.slug}`,
  () =>
    queryCollection('content')
      .path(`/${locale.value}/blog/${route.params.slug}`)
      .first()
)
</script>

<style scoped>
.container {
  max-width: 860px;
}
</style>
