export default defineNuxtPlugin(() => {
  // Must run before the embed init, but in practice it's OK as long as it's set early on client
  if (typeof window === 'undefined') return

  window.Cal = window.Cal || {}
  window.Cal.config = window.Cal.config || {}
  window.Cal.config.forwardQueryParams = true
})
