<template>
  <div>
    testvar: {{ testvar }}
    <ClientOnly>
      <div id="cal-inline" />
    </ClientOnly>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const { public: { testvar } } = useRuntimeConfig()

const route = useRoute()
const { locale } = useI18n()

const src = computed(() => (route.query.src || '').toString())
const cta = computed(() => (route.query.cta || '').toString())

const contextText = computed(() => {
  const lines = []
  if (src.value) lines.push(`Source: ${src.value}`)
  if (cta.value) lines.push(`CTA: ${cta.value}`)
  return lines.join('\n')
})

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}

onMounted(async () => {
  // Cal embed loader (their docs/snippet generator path)
  await loadScript('https://cal.com/embed.js')

  // init + inline
  window.Cal('init', { origin: 'https://cal.com' })
  window.Cal('ui', { theme: 'light' })

  window.Cal('inline', {
    elementOrSelector: '#cal-inline',
    calLink: `blockchange/${locale.value}`,
    config: contextText.value ? { notes: contextText.value } : {},
  })
})
</script>

<style scoped>
#cal-inline {
  min-height: 680px;
}

@media (max-width: 768px) {
  #cal-inline {
    min-height: 140vh;
  }
}
</style>
