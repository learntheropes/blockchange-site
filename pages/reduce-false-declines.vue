<template>
  <main v-if="page">

    <!-- HERO -->
    <section class="hero is-medium is-light page-hero">
      <div class="hero-body">
        <div class="container content-width">

          <!-- BREADCRUMB -->
          <nav class="breadcrumb is-small mb-4" aria-label="breadcrumbs">
            <ul>
              <li>
                <NuxtLink :to="page.meta.breadcrumbHomeHref">
                  {{ page.meta.breadcrumbHomeLabel }}
                </NuxtLink>
              </li>
              <li class="is-active">
                <a aria-current="page">{{ page.meta.breadcrumbCurrentLabel }}</a>
              </li>
            </ul>
          </nav>

          <h1 class="title is-2 mb-3">
            {{ page.meta.heroHeadline }}
          </h1>

          <p class="subtitle is-4 has-text-grey-dark">
            {{ page.meta.heroSubheadline }}
          </p>

        </div>
      </div>
    </section>

    <!-- CONTENT -->
    <section class="section">
      <div class="container content-width">
        <div v-for="(s, i) in page.meta.sections" :key="i" class="box shadow-soft section-card">
          <h2 class="title is-4 mb-3">{{ s.title }}</h2>
          <p class="content has-text-grey-dark mb-0">
            {{ s.text }}
          </p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="section">
      <div class="container content-width">
        <div class="box cta-box shadow-soft">
          <div class="columns is-vcentered">
            <div class="column is-8">
              <h2 class="title is-4 mb-2">{{ page.meta.bookingTitle }}</h2>
              <p class="has-text-grey mb-0">{{ page.meta.bookingText }}</p>
            </div>
            <div class="column is-4 has-text-right">
              <o-button variant="primary" size="large" tag="a" :href="page.meta.bookingCtaHref">
                {{ page.meta.bookingCtaLabel }}
              </o-button>
            </div>
          </div>
        </div>

        <p class="has-text-grey is-size-7 mt-4">
          {{ page.meta.relatedTopicsLabel }}
          <NuxtLink :to="page.meta.relatedTopics[0].href">{{ page.meta.relatedTopics[0].label }}</NuxtLink>,
          <NuxtLink :to="page.meta.relatedTopics[1].href">{{ page.meta.relatedTopics[1].label }}</NuxtLink>.
        </p>
      </div>
    </section>

  </main>
</template>

<script setup>
const { locale } = useI18n()
const route = useRoute()
const key = computed(() => `${route.path}-${locale.value}`)

const { data: page } = await useAsyncData(
  key.value + '-reduce-false-declines',
  () =>
    queryCollection('content')
      .path(`/${locale.value}/reduce-false-declines`)
      .first(),
  { watch: [locale, () => route.path] }
)
</script>

<style scoped>
.content-width {
  max-width: 900px;
}

.page-hero {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.cta-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.shadow-soft {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}

.section-card {
  margin-bottom: 1.25rem;
}

.cta-box {
  border: 1px solid rgba(0, 0, 0, 0.06);
}
</style>
