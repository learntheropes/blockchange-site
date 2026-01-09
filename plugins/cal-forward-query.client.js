export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return

  window.Cal = window.Cal || {}
  window.Cal.config = window.Cal.config || {}
  window.Cal.config.forwardQueryParams = true
})
