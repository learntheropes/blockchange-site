<script setup>
const { locale } = useI18n()
const route = useRoute()
const key = computed(() => `${route.path}-${locale.value}`)
const { data } = await useAsyncData(key + 'contacts', () => queryCollection('content').path(`/${locale.value}/contacts`).first(), { watch: [locale, () => route.path] })

</script>

<template>
  <div class="block">
    <clientOnly>
      <CalInlineWidget :cal-link="'blockchange/' + locale" :ui="{ theme: 'light' }" />
    </clientOnly>
  </div>
</template>
