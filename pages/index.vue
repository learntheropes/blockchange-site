<template>
  <main v-if="home">

    <!-- HERO -->
    <section class="hero is-large is-light">
      <div class="hero-body">
        <div class="container">
          <div class="columns is-vcentered is-variable is-8">

            <div class="column is-7">
              <h1 class="title is-2 mb-4">
                {{ home.meta.heroHeadline }}
              </h1>

              <p class="subtitle is-4 has-text-grey-dark mb-5">
                {{ home.meta.heroSubheadline }}
              </p>

              <div class="content mb-5">
                <ul>
                  <li v-for="(b, i) in home.meta.heroBullets" :key="i">
                    {{ b }}
                  </li>
                </ul>
              </div>

              <div class="cta-wrapper">
                <o-button
                  variant="primary"
                  size="large"
                  tag="a"
                  href="#book"
                >
                  Book a paid strategy call — $100/hour
                </o-button>

                <o-button
                  variant="light"
                  size="large"
                  tag="a"
                  href="#explanation"
                >
                  Learn more
                </o-button>
              </div>

              <div class="mt-4">
                <p class="has-text-grey is-size-7 mb-2">
                  {{ home.meta.paymentsTitle }}
                </p>
                <div class="tags">
                  <span
                    v-for="(p, i) in home.meta.paymentsItems"
                    :key="i"
                    class="tag is-info is-light"
                  >
                    {{ p }}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>

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
    <section class="section">
      <div class="container">
        <h2 class="title is-4">
          {{ home.meta.architectureLinksTitle }}
        </h2>

        <div class="columns is-variable is-6 mt-4">
          <div
            class="column is-6"
            v-for="(link, i) in home.meta.architectureLinks"
            :key="i"
          >
            <div class="box h-100">
              <h3 class="title is-5 mb-2">
                {{ link.title }}
              </h3>

              <p class="has-text-grey mb-4">
                {{ link.text }}
              </p>

              <o-button
                variant="light"
                tag="a"
                :href="link.href"
              >
                Read more →
              </o-button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- BOOKING -->
    <section class="section" id="book">
      <div class="container">
        <div class="box shadow-soft">
          <h2 class="title is-4">
            {{ home.meta.bookingTitle }}
          </h2>

          <p class="has-text-grey mb-1">
            {{ home.meta.bookingText }}
          </p>

          <p class="is-size-7 has-text-grey mb-4">
            {{ home.meta.bookingNote }}
          </p>
          <IndexContacts />
        </div>
      </div>
    </section>

  </main>
</template>

<script setup>
const { locale } = useI18n()
const route = useRoute()

const key = computed(() => `${route.path}-${locale.value}`)

const { data: home } = await useAsyncData(
  key.value + '-home',
  () =>
    queryCollection('content')
      .path(`/${locale.value}/home`)
      .first(),
  {
    watch: [locale, () => route.path]
  }
)
</script>

<style scoped>
.cta-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.shadow-soft {
  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
}
</style>
