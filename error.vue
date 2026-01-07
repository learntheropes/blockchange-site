<template>
  <div class="hero is-fullheight">
    <div class="hero-body">
      <div class="container has-text-centered">
        <p class="title">
          {{ translatedErrorMessage }}
        </p>

        <o-button class="mt-4" variant="primary" size="small" @click="handleError">
          {{ t('backToTheHomePage') }}
        </o-button>

        <DevOnly v-if="props.error?.statusCode !== 404">
          <div class="block content">
            <div>
              {{ props.error?.statusMessage || props.error?.message }}
            </div>
            <pre style="text-align:left; white-space:pre-wrap;">
{{ props.error?.stack }}
            </pre>
          </div>
        </DevOnly>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: {
    type: Object,
    required: true
  }
})

useHead(() => ({
  title: String(props.error?.statusCode || 'Error'),
  meta: [
    {
      name: 'description',
      content: props.error?.statusMessage || props.error?.message || 'Error'
    }
  ]
}))

const { locale, t } = useI18n()

const translatedErrorMessage = computed(() => {
  const code = props.error?.statusCode

  switch (code) {
    case 401:
      return t('unauthorized')
    case 403:
      return t('forbidden')
    case 404:
      return t('pageNotFound')
    default:
      return t('somethingWentWrong')
  }
})

const handleError = () => {
  clearError({ redirect: `/${locale.value}` })
}
</script>