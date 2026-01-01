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
                <NuxtLink to="/">Home</NuxtLink>
              </li>
              <li class="is-active">
                <a aria-current="page">In-ramp architecture</a>
              </li>
            </ul>
          </nav>

          <h1 class="title is-2 mb-3">
            {{ page.meta.heroHeadline }}
          </h1>

          <p class="subtitle is-4 has-text-grey-dark">
            {{ page.meta.heroSubheadline }}
          </p>

          <div class="cta-wrapper mt-5">
            <o-button variant="primary" size="large" tag="a" href="/#book">
              Book a paid strategy call — $100/hour
            </o-button>

            <o-button
              variant="light"
              size="large"
              tag="a"
              href="/off-ramp-and-payout-architecture"
            >
              View off-ramp architecture →
            </o-button>
          </div>
        </div>
      </div>
    </section>

    <!-- SUMMARY -->
    <section class="section">
      <div class="container content-width">
        <div class="box shadow-soft">
          <h2 class="title is-4 mb-2">What this page covers</h2>
          <p class="has-text-grey mb-4">
            A practical blueprint for building resilient payment acceptance across multiple rails.
          </p>

          <div class="columns is-multiline">
            <div class="column is-6">
              <div class="summary-item">
                <p class="title is-6 mb-1">Goal</p>
                <p class="has-text-grey">
                  Increase acceptance rates and reduce declines with routing and fallbacks.
                </p>
              </div>
            </div>
            <div class="column is-6">
              <div class="summary-item">
                <p class="title is-6 mb-1">Outcome</p>
                <p class="has-text-grey">
                  A provider-agnostic in-ramp system that adapts to markets, risk, and policy changes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTIONS -->
    <section class="section">
      <div class="container content-width">
        <div
          v-for="(s, i) in page.meta.sections"
          :key="i"
          class="box shadow-soft section-card"
        >
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
              <o-button variant="primary" size="large" tag="a" href="/#book">
                Book now
              </o-button>
            </div>
          </div>
        </div>

        <p class="has-text-grey is-size-7 mt-4">
          Want the full picture? Pair this with
          <NuxtLink to="/off-ramp-and-payout-architecture">off-ramp & payout architecture</NuxtLink>.
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
  key.value + '-in-ramp',
  () =>
    queryCollection('content')
      .path(`/${locale.value}/in-ramp-architecture`)
      .first(),
  { watch: [locale, () => route.path] }
)
</script>

<style scoped>
.content-width {
  max-width: 900px;
}

.page-hero {
  border-bottom: 1px solid rgba(0,0,0,0.06);
}

.cta-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.shadow-soft {
  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
}

.section-card {
  margin-bottom: 1.25rem;
}

.summary-item {
  padding: .25rem 0;
}

.cta-box {
  border: 1px solid rgba(0,0,0,0.06);
}
</style>
