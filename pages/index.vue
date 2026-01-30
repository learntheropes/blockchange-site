<template>
  <NuxtLayout>
    <!-- HERO -->
    <IndexHero :home="home" />

    <!-- EXPLANATION -->
    <section class="section" id="explanation">
      <div class="container">
        <h2 class="title is-3">
          {{ home.meta.explanationTitle }}
        </h2>

        <div class="content is-size-5 has-text-grey-dark">
          {{ home.meta.explanationText }}
        </div>
      </div>
    </section>

    <!-- ARCHITECTURE LINKS -->
    <section class="section" id="architecture">
      <div class="container">
        <h2 class="title is-4">
          {{ home.meta.architectureLinksTitle }}
        </h2>

        <div class="columns is-variable is-6 mt-4">
          <div v-for="(p, i) in home.meta.pillars" :key="i" class="column is-4">
            <div class="box shadow-soft pillar-card">
              <h3 class="title is-5 mb-2">{{ p.title }}</h3>
              <p class="has-text-grey mb-4">{{ p.text }}</p>

              <NuxtLink :to="localePath(p.href)" class="mt-auto">
                <o-button variant="light" class="mt-auto" :aria-label="`${home.meta.a11yReadPrefix}: ${p.title}`">
                  {{ home.meta.learnMore }}
                </o-button>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CONTACT / BOOKING -->
    <section class="section" id="book">
      <div class="container">
        <h2 class="title is-4">
          {{ home.meta.contactTitle }}
        </h2>

        <p class="has-text-grey mb-4">
          {{ home.meta.contactIntro }}
        </p>

        <!-- Quick anchors -->
        <div class="buttons mb-5">
          <o-button variant="light" size="small" tag="a" href="#call">
            {{ home.meta.bookAnchorsCallLabel }}
          </o-button>
          <o-button variant="light" size="small" tag="a" href="#mail">
            {{ home.meta.bookAnchorsMailLabel }}
          </o-button>
        </div>

        <!-- CALL (PAID) -->
        <div id="call" class="box shadow-soft section-card mb-6">
          <h3 class="title is-4 mb-1">{{ home.meta.bookCallTitle }}</h3>

          <p class="has-text-grey mb-2">
            {{ home.meta.bookCallMetaPrefix }}
            <strong>{{ home.meta.bookCallPrice }}</strong>
          </p>

          <p class="has-text-grey mb-4">
            {{ home.meta.bookCallDescription }}
          </p>

          <CalInlineWidget :cal-link="calLink" :ui-options="{ theme: 'light' }" height="680px" />

          <p class="is-size-7 has-text-grey mt-3">
            {{ home.meta.bookCallNotesHint }}
          </p>

          <p class="is-size-7 has-text-grey mt-2">
            {{ home.meta.bookCallWhyPaidHint }}
          </p>

          <div class="mb-5">
            <o-button variant="text" size="small" tag="a" href="#book">
              {{ home.meta.bookAnchorsTopLabel }}
            </o-button>
          </div>
        </div>

        <!-- EMAIL (FREE) -->
        <div id="mail" class="box shadow-soft section-card">
          <h3 class="title is-4 mb-1">{{ home.meta.bookMailTitle }}</h3>

          <p class="has-text-grey mb-2">
            {{ home.meta.bookMailMetaPrefix }}
            <strong>{{ home.meta.bookMailPrice }}</strong>
          </p>

          <p class="has-text-grey mb-4">
            {{ home.meta.bookMailDescription }}
          </p>

          <div class="buttons">
            <o-button variant="primary" size="large" tag="a" :href="mailtoHref">
              {{ home.meta.bookMailCtaLabel }}
            </o-button>

            <o-button v-if="contextText" variant="text" size="large" @click="copy(contextText)">
              {{ home.meta.bookCopyContextLabel }}
            </o-button>
          </div>

          <hr />

          <h4 class="title is-6 mb-2">{{ home.meta.bookPgpTitle }}</h4>
          <pre class="p-3 has-background-light" style="white-space: pre-wrap;">
-----BEGIN PGP PUBLIC KEY BLOCK-----

xjMEZ7mqMRYJKwYBBAHaRw8BAQdAno9TkyGUNtgvwj9r8fxVINjI6Rwzl9G42kua
zH0A/LDNM2hlbGxvQGJsb2NrY2hhbmdlLmNvbS5weSA8aGVsbG9AYmxvY2tjaGFu
Z2UuY29tLnB5PsLAEQQTFgoAgwWCZ7mqMQMLCQcJkINN8LrhQ7KMRRQAAAAAABwA
IHNhbHRAbm90YXRpb25zLm9wZW5wZ3Bqcy5vcmdw8xKYbGObjt18guKYmEph2KVl
9hFjxbg3/PGsGlg3egMVCggEFgACAQIZAQKbAwIeARYhBKEEX1rBhWpXzgwC7oNN
8LrhQ7KMAAD4QQD9EU7/tfL1XXAtuFZgAIDlVAu7DS0nYSecU3GNSQ1zvEYA+gN+
uX0fp8ySrK3yj+jgdNaqC5L4mBAGmN7yKyoaAOoJzjgEZ7mqMRIKKwYBBAGXVQEF
AQEHQDVZENdsrDZf4PlRPeP5IqgGV52QR844eEqvIV2Td9UQAwEIB8K+BBgWCgBw
BYJnuaoxCZCDTfC64UOyjEUUAAAAAAAcACBzYWx0QG5vdGF0aW9ucy5vcGVucGdw
anMub3JnN20CGjwg7IXiOADOw9LDmPb/61vi3qXrIMOXfwAJn2MCmwwWIQShBF9a
wYVqV84MAu6DTfC64UOyjAAASt0A/jLnhYaOVa8Zd6kHh1WJpN3UNoZXnABoN+hW
MTile9olAP4rZdhk9q1iiBLstS9ouyocsGbadWTbqBm5iAy8qKpUBg==
=sC5I

-----END PGP PUBLIC KEY BLOCK-----
          </pre>

          <div class="mb-5">
            <o-button variant="text" size="small" tag="a" href="#book">
              {{ home.meta.bookAnchorsTopLabel }}
            </o-button>
          </div>
        </div>
      </div>
    </section>

    <!-- BLOG PREVIEW -->
    <section class="section" id="blog">
      <div class="container">
        <h2 class="title is-4 mb-4">
          {{ home.meta.latestInsightsTitle }}
        </h2>

        <div class="columns is-multiline is-centered is-variable is-6">
          <div v-for="post in posts" :key="post.path" class="column is-4">
            <div class="box shadow-soft blog-card">
              <h3 class="title is-5 mb-2">{{ post.title }}</h3>

              <p class="has-text-grey blog-excerpt">
                {{ post.description }}
              </p>

              <NuxtLink :to="post.path" class="mt-4">
                <o-button class="mt-4" variant="light" size="small"
                  :aria-label="`${home.meta.a11yReadPrefix}: ${post.title}`">
                  {{ home.meta.readMore }}
                </o-button>
              </NuxtLink>
            </div>
          </div>
        </div>

        <div class="has-text-centered mt-5">
          <o-button variant="primary" @click="showAllPosts = !showAllPosts">
            {{ showAllPosts ? home.meta.viewLessArticles : home.meta.viewAllArticles }}
          </o-button>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()

/* Home content */
const { data: home } = await useAsyncData(
  () => `home-${locale.value}`,
  () =>
    queryCollection('content')
      .path(`/${locale.value}/home`)
      .first(),
  { watch: [locale] }
)

useHead(() => ({
  title: home.value?.meta?.heroHeadline,
  meta: [
    { name: 'description', content: home.value?.meta?.heroSubheadline },
    { property: 'og:title', content: home.value?.meta?.heroHeadline },
    { property: 'og:description', content: home.value?.meta?.heroSubheadline },
  ],
}))

/* Blog list */
const showAllPosts = ref(false)

const { data: allPosts } = await useAsyncData(
  () => `blog-index-${locale.value}`,
  async () => {
    const all = await queryCollection('content').limit(200).all()

    return (all || [])
      .filter(x => x?.stem?.startsWith(`${locale.value}/blog/`))
      .map(x => ({
        path: x.path,
        title: x.title,
        description: x.description,
        date: x.meta?.date,
      }))
      .sort((a, b) => Date.parse(b.date || 0) - Date.parse(a.date || 0))
  },
  { watch: [locale] }
)

const posts = computed(() => {
  const items = allPosts.value || []
  return showAllPosts.value ? items : items.slice(0, 3)
})

/* JSON-LD structured data */
const { $jsonld } = useNuxtApp()

useJsonld(() => {
  const pillars = home.value?.meta?.pillars
  const posts = allPosts.value
  if (!Array.isArray(pillars) || !Array.isArray(posts)) return null

  return $jsonld.graph([
    $jsonld.logo(),
    $jsonld.organization(),
    $jsonld.website(),
    $jsonld.indexWebPage(home.value?.meta?.heroHeadline, home.value?.meta?.heroSubheadline),
    $jsonld.indexBreadcrumbs({
      homeLabel: t('schema.breadcrumbs.home'),
      homePath: `/${locale.value}/`
    }),
    $jsonld.indexSection({ id: 'explanation', name: home.value?.meta?.explanationTitle || 'Explanation' }),
    $jsonld.indexSection({ id: 'blog', name: home.value?.meta?.latestInsightsTitle || 'Blog' }),
  ])
})

/* Attribution context */
const src = computed(() => String(route.query.src || ''))
const cta = computed(() => String(route.query.cta || ''))
const notes = computed(() => String(route.query.notes || ''))

const contextText = computed(() => {
  const lines = []
  if (src.value) lines.push(`${home.value?.meta?.bookContextSourceLabel}: ${src.value}`)
  if (cta.value) lines.push(`${home.value?.meta?.bookContextCtaLabel}: ${cta.value}`)
  if (!cta.value && notes.value) lines.push(`${home.value?.meta?.bookContextCtaLabel}: ${notes.value}`)
  return lines.join('\n')
})

/* Cal.com */
const calLink = computed(() => {
  const base = `blockchange/${locale.value}`
  const q = new URLSearchParams()
  if (contextText.value) q.set('notes', contextText.value)
  return q.toString() ? `${base}?${q}` : base
})

/* Email */
const emailTo = 'hello@blockchange.com'
const encode = (s) => encodeURIComponent(String(s || ''))

const mailtoHref = computed(() => {
  const subject = home.value?.meta?.bookMailSubject
  const body = [
    home.value?.meta?.bookMailBodyGreeting,
    '',
    home.value?.meta?.bookMailBodyContextTitle,
    contextText.value || home.value?.meta?.bookMailBodyNoContext,
    '',
    home.value?.meta?.bookMailBodyMessageTitle,
    '',
  ].join('\n')

  return `mailto:${emailTo}?subject=${encode(subject)}&body=${encode(body)}`
})

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text)
  } catch { }
}
</script>

<style scoped>
.shadow-soft {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}

.pillar-card,
.blog-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.blog-excerpt {
  flex: 1;
  font-size: 1rem;
  line-height: 1.6;
}

.mt-auto {
  margin-top: auto;
}
</style>