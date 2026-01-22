<template>
  <div>
    <div class="columns is-multiline is-variable is-3">
      <div class="column is-narrow">
        <o-button variant="primary" size="large" tag="router-link" :to="callHref">
          {{ $t('home.book.bookPaid') }}
        </o-button>
      </div>

      <div class="column is-narrow">
        <o-button variant="primary" size="large" tag="router-link" :to="mailHref">
          {{ $t('home.book.bookFree') }}
        </o-button>
      </div>

      <div class="column is-narrow">
        <o-button variant="text" size="large" tag="router-link" :to="explanationHref"
          :aria-label="$t('home.book.learnMoreAria')">
          {{ $t('home.book.learnMore') }}
        </o-button>
      </div>
    </div>
  </div>
</template>

<script setup>
const localePath = useLocalePath()
const callHref = computed(() => `${localePath('/')}#call`)
const mailHref = computed(() => `${localePath('/')}#mail`)
const explanationHref = computed(() => `${localePath('/')}#explanation`)
</script>
