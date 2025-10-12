import { nextTick } from 'vue'

const wait = (ms) => new Promise(r => setTimeout(r, ms))
async function waitForEl(hash, tries = 40, delay = 50) {
  for (let i = 0; i < tries; i++) {
    const el = hash && document.querySelector(hash)
    if (el) return el
    await wait(delay)
  }
  return null
}

export default defineNuxtPlugin((nuxtApp) => {
  // Fire after every navigation (including same-path, hash-only changes)
  nuxtApp.$router.afterEach(async (to) => {
    if (!to.hash) return
    // ensure DOM rendered / hydrated
    await nextTick()
    await new Promise(r => requestAnimationFrame(() => r()))
    const el = await waitForEl(to.hash)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
})