<script setup>
const { locale } = useI18n()
const route = useRoute()
const key = computed(() => `${route.path}-${locale.value}`)
const { data } = await useAsyncData( key + 'contacts', () => queryCollection('content').path(`/${locale.value}/contacts`).first(), { watch: [locale, () => route.path] })

</script>

<template>
<div class="block">
  <!-- <h2 class="title is-5 has-text-primary" id="contact">{{  $t('contactsTitle') }}</h2> -->
  <!-- <ContentRenderer :value="data" class="content" /> -->
  <clientOnly>
    <CalInlineWidget :cal-link="'blockchange/' + locale" :ui="{ theme: 'light' }" />
  </clientOnly>
</div>
</template>
