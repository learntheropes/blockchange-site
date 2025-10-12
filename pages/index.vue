<script setup>
const { locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const key = computed(() => `${route.path}-${locale.value}`)
const { data } = await useAsyncData( key + 'expertise', () => queryCollection('content').path(`/${locale.value}/expertise`).first(), { watch: [locale, () => route.path] })
const { data: contactData } = await useAsyncData( key + 'contact', () => queryCollection('content').path(`/${locale.value}/contact`).first(), { watch: [locale, () => `/${locale.value}/contact`] })

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

const energyAnchor = computed(() =>
  data.value?.meta?.taxTitle
    ? '#' + data.value.meta.energyTitle.toLowerCase().replace(/\s+/g, '-')
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

const energyTo = computed(() => ({
  path: localePath('/advantages'),
  hash: energyAnchor.value,
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
      <div class="block">
        <h2 class="title is-5" id="advantages">{{  data.meta.keyAdvantages }}</h2>
        <div class="columns is-align-items-stretch">
          <div class="column is-flex is-flex-direction-column">
            <div class="card is-flex is-flex-direction-column is-flex-grow-1">
              <header class="card-header">
                <h3 class="card-header-title">{{ data.meta.taxTitle }}</h3>
              </header>
              <div class="card-content is-flex-grow-1">
                <div class="content">{{ data.meta.taxContent }}</div>
              </div>
              <footer class="card-footer" style="margin-top:auto">
                <NuxtLink :to="taxTo" class="card-footer-item">{{ data.meta.button }}</NuxtLink>
              </footer>
            </div>
          </div>
          <div class="column is-flex is-flex-direction-column">
            <div class="card is-flex is-flex-direction-column is-flex-grow-1">
              <header class="card-header">
                <h3 class="card-header-title">{{ data.meta.complianceTitle }}</h3>
              </header>
              <div class="card-content is-flex-grow-1">
                <div class="content">{{ data.meta.complianceContent }}</div>
              </div>
              <footer class="card-footer" style="margin-top:auto">
                <NuxtLink :to="complianceTo" class="card-footer-item">{{ data.meta.button }}</NuxtLink>
              </footer>
            </div>
          </div>
          <div class="column is-flex is-flex-direction-column">
            <div class="card is-flex is-flex-direction-column is-flex-grow-1">
              <header class="card-header">
                <h3 class="card-header-title">{{ data.meta.energyTitle }}</h3>
              </header>
              <div class="card-content is-flex-grow-1">
                <div class="content">{{ data.meta.energyContent }}</div>
              </div>
              <footer class="card-footer" style="margin-top:auto">
                <NuxtLink :to="energyTo" class="card-footer-item">{{ data.meta.button }}</NuxtLink>
              </footer>
            </div>
          </div>
        </div>
      </div>
      <div class="block">
        <h2 class="title is-5" id="expertise">{{  data.meta.expertise }}</h2>
        <ContentRenderer :value="data" class="content" />
        <div class="columns is-align-items-stretch">
          <div class="column is-flex is-flex-direction-column">
            <div class="card is-flex is-flex-direction-column is-flex-grow-1">
              <header class="card-header">
                <h3 class="card-header-title">{{ data.meta.bitcoinTitle }}</h3>
              </header>
              <div class="card-content is-flex-grow-1">
                <div class="content">{{ data.meta.bitcoinContent }}</div>
              </div>
            </div>
          </div>
          <div class="column is-flex is-flex-direction-column">
            <div class="card is-flex is-flex-direction-column is-flex-grow-1">
              <header class="card-header">
                <h3 class="card-header-title">{{ data.meta.industryTitle }}</h3>
              </header>
              <div class="card-content is-flex-grow-1">
                <div class="content">{{ data.meta.industryContent }}</div>
              </div>
            </div>
          </div>
          <div class="column is-flex is-flex-direction-column">
            <div class="card is-flex is-flex-direction-column is-flex-grow-1">
              <header class="card-header">
                <h3 class="card-header-title">{{ data.meta.paraguayTitle }}</h3>
              </header>
              <div class="card-content is-flex-grow-1">
                <div class="content">{{ data.meta.paraguayContent }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="block">
        <h2 class="title is-5" id="contact">{{  data.meta.contact }}</h2>
        <ContentRenderer :value="contactData" class="content" />
        <CalInlineWidget :cal-link="'blockchange/' + locale" :ui="{ theme: 'light' }" />
      </div>
    </div>
  </NuxtLayout>
</template>
