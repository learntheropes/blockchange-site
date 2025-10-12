<script setup>
const { locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const key = computed(() => `${route.path}-${locale.value}`)
const { data, pending, error } = await useAsyncData( key, () => queryCollection('content').path(route.path).first(), { watch: [locale, () => route.path] })

const taxAnchor = computed(() =>
  data.value?.meta?.taxTitle
    ? '#' + data.value.meta.taxTitle.toLowerCase().replace(/\s+/g, '-')
    : ''
)

const complianceAnchor = computed(() =>
  data.value?.meta?.complianceTitle
    ? '#' + data.value.meta.complianceTitle.toLowerCase().replace(/\s+/g, '-')
    : ''
)

const taxTo = computed(() => ({
  path: localePath('/advantages/'),
  hash: taxAnchor.value
}))

const complianceTo = computed(() => ({
  path: localePath('/advantages'),
  hash: complianceAnchor.value,
}))


useHead({
  title: data.value.title,
  meta: [
    {
      id: 'description',
      name: 'description',
      content: data.value.description
    },
    {
      id: 'og:title',
      name: 'og:title',
      content: data.value.title
    },
    {
      id: 'og:description',
      name: 'og:description',
      content: data.value.description
    },
  ],
});
</script>

<template>
  <NuxtLayout>
    <div class="container">
      <h1 class="title has-text-primary">{{ data.title }}</h1>
      <h1 class="subtitle">{{ data.description }}</h1>
      <!-- <ContentRenderer :value="data" class="content" /> -->
       <div class="columns">
        <div class="column">
          <div class="card">
            <header class="card-header">
              <p class="card-header-title">{{ data.meta.taxTitle}}</p>
            </header>
            <div class="card-content">
              <div class="content">{{ data.meta.taxContent }}</div>
            </div>
            <footer class="card-footer">
              <NuxtLink :to="taxTo" class="card-footer-item">{{ data.meta.taxButton }}</NuxtLink>
            </footer>
          </div>
        </div>
        <div class="column">
          <div class="card">
            <header class="card-header">
              <p class="card-header-title">{{ data.meta.complianceTitle}}</p>
            </header>
            <div class="card-content">
              <div class="content">{{ data.meta.complianceContent }}</div>
            </div>
            <footer class="card-footer">
              <NuxtLink :to="complianceTo" class="card-footer-item">{{ data.meta.complianceButton }}</NuxtLink>
            </footer>
          </div>
        </div>
       </div>
      <CalInlineWidget cal-link="blockchange/meeting" :ui="{ theme: 'light' }" />
    </div>
  </NuxtLayout>
</template>
