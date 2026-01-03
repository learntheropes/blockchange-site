<script setup>
const { locale } = useI18n()
const route = useRoute()
const key = computed(() => `${route.path}-${locale.value}`)
const { data: home } = await useAsyncData(key + 'contacts', () => queryCollection('content').path(`/${locale.value}/home`).first(), { watch: [locale, () => route.path] })

</script>

<template>
  <div id="mail">
    <h3 class="title is-5 mb-2">
      {{ home.meta.asyncTitle }}
    </h3>

    <p class="has-text-grey mb-4">
      {{ home.meta.asyncText }}
    </p>

    <div class="content">
      <p class="mb-2">
        <strong>{{ home.meta.emailLabel }}: </strong>
        <a :href="`mailto:${home.meta.emailAddress}`">
          {{ home.meta.emailAddress }}
        </a>
      </p>

      <p class="mb-0">
        <strong>{{ home.meta.pgpLabel }}: </strong>
        <a :href="home.meta.pgpLink" target="_blank" rel="noopener">
          {{ home.meta.pgpFingerprint }}
        </a>
      </p>
    </div>
    <div class="block" id="call">
      <h3 class="title is-5 mb-2">
        {{ home.meta.syncTitle }}
      </h3>

      <p class="has-text-grey mb-3">
        {{ home.meta.syncText }}
      </p>
      <clientOnly>
        <CalInlineWidget :cal-link="'blockchange/' + locale" :ui="{ theme: 'light' }" />
      </clientOnly>
    </div>
  </div>
</template>
