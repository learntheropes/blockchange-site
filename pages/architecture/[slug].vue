<template>
  <NuxtLayout>
    <section class="hero is-medium is-light page-hero">
      <div class="hero-body">
        <div class="container content-width">

          <nav class="breadcrumb is-small mb-4" aria-label="breadcrumbs">
            <ul>
              <li>
                <NuxtLink :to="architecture.meta.breadcrumbHomeHref">
                  {{ architecture.meta.breadcrumbHomeLabel }}
                </NuxtLink>
              </li>
              <li class="is-active">
                <a aria-current="page">{{ architecture.meta.breadcrumbCurrentLabel }}</a>
              </li>
            </ul>
          </nav>

          <h1 class="title is-2 mb-3">
            {{ architecture.meta.heroHeadline }}
          </h1>

          <p class="subtitle is-4 has-text-grey-dark">
            {{ architecture.meta.heroSubheadline }}
          </p>

        </div>
      </div>
    </section>

    <section class="section">
      <div class="container content-width">
        <div v-for="(s, i) in architecture.meta.sections" :key="i" class="box shadow-soft section-card">
          <h2 class="title is-4 mb-3">{{ s.title }}</h2>
          <p class="content has-text-grey-dark mb-0">
            {{ s.text }}
          </p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container content-width">
        <div class="box cta-box shadow-soft">
          <div class="columns is-vcentered">
            <div class="column is-8">
              <h2 class="title is-4 mb-2">{{ architecture.meta.bookingTitle }}</h2>
              <p class="has-text-grey mb-0">{{ architecture.meta.bookingText }}</p>
            </div>
            <div class="column is-4 has-text-right">
              <o-button variant="primary" size="large" tag="a" :href="architecture.meta.bookingCtaHref">
                {{ architecture.meta.bookingCtaLabel }}
              </o-button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup>
const { locale } = useI18n()
const route = useRoute()
const key = computed(() => `${route.path}-${locale.value}`)
const slug = route.params.slug;

const { data: architecture } = await useAsyncData(
  key.value + '-architecture',
  () =>
    queryCollection('content')
      .path(`/${locale.value}/architecture/${slug}`)
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
