import { resolve } from 'node:path'

const isSSG = process.env.NUXT_SSG === 'true'
const isDeployed = process.env.NODE_ENV === 'production'
const websiteUrl = process.env.WEBSITE_URL || 'http://localhost:3000'
import { locales, localeCodes, defaultLocale } from './assets/js/localization'

const ABS_CALCOM_PLUGIN = resolve('./node_modules/nuxt-calcom/runtime/plugin')
const CALCOM_PLUGIN_TARGET = resolve('./node_modules/nuxt-calcom/dist/runtime/plugin.ts')
const ABS_CALCOM_COMPONENTS = resolve('./node_modules/nuxt-calcom/runtime/components')
const CALCOM_COMPONENTS_TARGET = resolve('./node_modules/nuxt-calcom/dist/runtime/components')

export default defineNuxtConfig({
  compatibilityDate: '2025-10-10',

  runtimeConfig: {
    public: {
      websiteUrl,
    }
  },

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
        { id: 'og:url', name: 'og:url', content: websiteUrl },
        { id: 'og:site_name', name: 'og:site_name', content: 'Blockchange' },
        { id: 'og:image', name: 'og:image', content: `${websiteUrl}/favicon/favicon.png` },
        { id: 'twitter:card', name: 'twitter:card', content: 'summary' },
        { id: 'twitter:image', name: 'twitter:image', content: `${websiteUrl}/favicon/favicon.png` },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon/favicon.ico' }],
    },
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
    'nuxt-jsonld',
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
    baseUrl: websiteUrl,
    locales,
    defaultLocale,
    lazy: true,
    langDir: 'lang',
    strategy: 'prefix',
    trailingSlash: true,
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
