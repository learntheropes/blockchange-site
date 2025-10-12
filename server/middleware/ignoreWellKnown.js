export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname
  if (path.startsWith('/.well-known/')) {
    return ''
  }
})