import fs from 'node:fs'
import path from 'node:path'
import { resolve } from 'node:path'

const isSSG = process.env.NUXT_SSG === 'true'
const isDeployed = process.env.NODE_ENV === 'production'

const deploymentDomain = String(
  process.env.NUXT_PUBLIC_SITE_URL || process.env.URL || 'http://localhost:3000'
)
  .trim()
  .replace(/\/+$/, '') // no trailing slash

import { locales, localeCodes, defaultLocale } from './assets/js/localization'

const ABS_CALCOM_PLUGIN = resolve('./node_modules/nuxt-calcom/runtime/plugin')
const CALCOM_PLUGIN_TARGET = resolve('./node_modules/nuxt-calcom/dist/runtime/plugin.ts')
const ABS_CALCOM_COMPONENTS = resolve('./node_modules/nuxt-calcom/runtime/components')
const CALCOM_COMPONENTS_TARGET = resolve('./node_modules/nuxt-calcom/dist/runtime/components')

const CONTENT_DIR = path.resolve(process.cwd(), 'content')

function walk(dir) {
  const out = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

function withTrailingSlash(p) {
  if (p === '/') return '/'
  return p.endsWith('/') ? p : `${p}/`
}

function contentFileToRoute(file, localeList) {
  const rel = path.relative(CONTENT_DIR, file).replaceAll('\\', '/')
  const noExt = rel.replace(/\.(md|mdc)$/i, '')
  const parts = noExt.split('/').filter(Boolean)
  if (!parts.length) return null

  const locale = parts[0]
  if (!localeList.includes(locale)) return null

  let rest = parts.slice(1)

  // home/index => /{locale}/
  if (rest.length === 0) rest = []
  if (rest.length === 1 && ['home', 'index'].includes(rest[0].toLowerCase())) rest = []

  // drop trailing index
  if (rest[rest.length - 1]?.toLowerCase() === 'index') rest = rest.slice(0, -1)

  const route = rest.length ? `/${locale}/${rest.join('/')}` : `/${locale}`
  return withTrailingSlash(route)
}

function buildPrerenderRoutes(localeList) {
  if (!fs.existsSync(CONTENT_DIR)) return []

  const files = walk(CONTENT_DIR).filter(f => /\.(md|mdc)$/i.test(f))
  const routes = new Set()

  // seed roots
  routes.add('/')
  for (const l of localeList) routes.add(withTrailingSlash(`/${l}`))

  for (const f of files) {
    const r = contentFileToRoute(f, localeList)
    if (!r) continue

    // exclude ONLY the listing endpoints (exact pages)
    // (if you actually have content pages for these and want them, remove these 2 lines)
    if (r === '/en/blog/' || r === '/en/architecture/') continue

    routes.add(r)
  }

  return [...routes]
}

export default defineNuxtConfig({
  site: {
    url: 'https://blockchange.com.py',
    name: 'Blockchange',
  },

  compatibilityDate: '2025-10-10',

  // ✅ make trailing slash canonical for GH Pages / static hosting
  router: {
    options: {
      trailingSlash: true,
    },
  },

  alias: {
    'nuxt-calcom/runtime/plugin': CALCOM_PLUGIN_TARGET,
    [ABS_CALCOM_PLUGIN]: CALCOM_PLUGIN_TARGET,
    'nuxt-calcom/runtime/components': CALCOM_COMPONENTS_TARGET,
    [ABS_CALCOM_COMPONENTS]: CALCOM_COMPONENTS_TARGET,
  },

  vite: {
    resolve: {
      alias: {
        'nuxt-calcom/runtime/plugin': CALCOM_PLUGIN_TARGET,
        [ABS_CALCOM_PLUGIN]: CALCOM_PLUGIN_TARGET,
        'nuxt-calcom/runtime/components': CALCOM_COMPONENTS_TARGET,
        [ABS_CALCOM_COMPONENTS]: CALCOM_COMPONENTS_TARGET,
      },
    },
  },

  build: { transpile: ['nuxt-calcom'] },

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { id: 'googlebot', name: 'googlebot', content: 'notranslate' },
        { id: 'og:type', name: 'og:type', content: 'website' },
        { id: 'og:url', name: 'og:url', content: deploymentDomain },
        { id: 'og:site_name', name: 'og:site_name', content: 'Blockchange' },
        { id: 'og:image', name: 'og:image', content: `${deploymentDomain}/favicon/favicon.png` },
        { id: 'twitter:card', name: 'twitter:card', content: 'summary' },
        { id: 'twitter:image', name: 'twitter:image', content: `${deploymentDomain}/favicon/favicon.png` },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon/favicon.ico' }],
    },
  },

  routeRules: {
    '/en/blog': { redirect: '/en/#blog' },
    '/blog': { redirect: '/en/#blog' },
    '/en/architecture': { redirect: '/en/#architecture' },
    '/architecture': { redirect: '/en/#architecture' },
  },

  css: ['~/assets/scss/main.scss'],
  components: [{ path: '~/components', pathPrefix: false, global: true }],

  modules: [
    '@nuxtjs/i18n',
    'nuxt-delay-hydration',
    'nuxt-umami',
    'nuxt-calcom',
    '@nuxt/content',
    ...(isSSG ? [] : ['@nuxthub/core']),
  ],

  ...(isSSG
    ? {}
    : {
      hub: {
        blob: true,
        cache: true,
        database: true,
        kv: false,
        remote: process.env.NUXT_HUB_REMOTE === 'true',
      },
    }),

  umami: {
    enabled: isDeployed,
    id: process.env.NUXT_PUBLIC_UMAMI_ID,
    host: process.env.NUXT_PUBLIC_UMAMI_HOST,
    autoTrack: true,
  },

  i18n: {
    baseUrl: deploymentDomain,
    locales,
    defaultLocale,
    lazy: true,
    langDir: 'lang',
    strategy: 'prefix',
    bundle: {
      optimizeTranslationDirective: false,
    },
    detectBrowserLanguage: {
      useCookie: false,
      redirectOnRoot: true,
      redirectOn: 'root',
    },
  },

  content: {
    locales: localeCodes,
    defaultLocale,
    anchorLinks: false,
  },

  delayHydration: { mode: 'init', debug: !isDeployed },

  hooks: {
    'builder:watch': (event, path) => {
      if (path.includes('manifest-route-rule')) return false
    },
  },

  nitro: {
    prerender: {
      failOnError: false,
      crawlLinks: true,
      routes: buildPrerenderRoutes(localeCodes),
    },
    preset: isSSG ? 'static' : 'cloudflare_module',
    external: process.env.NUXT_HUB_REMOTE === 'false' ? [] : undefined,
    storage: {
      'content:source': {
        driver: 'fs',
        base: resolve('./content'),
      },
    },
  },

  experimental: {
    defaults: {
      nuxtLink: {
        trailingSlash: 'append',
      },
    },
  },
})
