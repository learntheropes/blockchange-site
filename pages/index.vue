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

            <!-- optional right column later if you want -->
            <!-- <div class="column is-5"></div> -->

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

    <!-- PILLAR LINKS (ONLY ONCE) -->
    <section class="section" v-if="home.meta.pillars && home.meta.pillars.length">
      <div class="container">
        <h2 class="title is-4">
          {{ home.meta.architectureLinksTitle || 'Explore the architecture in detail' }}
        </h2>

        <div class="columns is-multiline is-variable is-6 mt-4">
          <div
            v-for="(p, i) in home.meta.pillars"
            :key="i"
            class="column is-4"
          >
            <div class="box shadow-soft h-full pillar-card">
              <h3 class="title is-5 mb-2">{{ p.title }}</h3>
              <p class="has-text-grey mb-4">{{ p.text }}</p>
              <o-button
                class="mt-auto"
                variant="primary"
                tag="a"
                :href="p.href"
              >
              {{ home.meta.learnMore }}
              </o-button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CONTACT / BOOKING -->
    <section class="section" id="book">
      <div class="container">
        <div class="box shadow-soft">

          <h2 class="title is-4">
            {{ home.meta.contactTitle }}
          </h2>

          <p class="has-text-grey mb-5">
            {{ home.meta.contactIntro }}
          </p>

          <div class="columns is-variable is-6">

            <!-- ASYNC -->
            <div class="column is-6">
              <h3 class="title is-5 mb-2">
                {{ home.meta.asyncTitle }}
              </h3>

              <p class="has-text-grey mb-4">
                {{ home.meta.asyncText }}
              </p>

              <div class="content">
                <p class="mb-2">
                  <strong>{{ home.meta.emailLabel }}:</strong>
                  <a :href="`mailto:${home.meta.emailAddress}`">
                    {{ home.meta.emailAddress }}
                  </a>
                </p>

                <p class="mb-0">
                  <strong>{{ home.meta.pgpLabel }}:</strong>
                  <a :href="home.meta.pgpLink" target="_blank" rel="noopener">
                    {{ home.meta.pgpFingerprint }}
                  </a>
                </p>
              </div>

              <div class="mt-4">
                <o-button
                  variant="light"
                  tag="a"
                  :href="`mailto:${home.meta.emailAddress}`"
                >
                  {{ home.meta.emailUs }}
                </o-button>
              </div>
            </div>

            <!-- SYNC -->
            <div class="column is-6">
              <h3 class="title is-5 mb-2">
                {{ home.meta.syncTitle }}
              </h3>

              <p class="has-text-grey mb-3">
                {{ home.meta.syncText }}
              </p>

              <p class="is-size-7 has-text-grey mb-4" v-if="home.meta.bookingNote">
                {{ home.meta.bookingNote }}
              </p>
              <!-- Your existing Cal.com / BTCPay widget -->
              <IndexContacts />
            </div>
          </div>
          <!-- BLOG PREVIEW -->
          <section class="section">
            <div class="container">
              <h2 class="title is-4 mb-4">Latest insights</h2>

              <div class="columns is-multiline is-centered is-variable is-6">
                <div
                  v-for="post in posts"
                  :key="post.path"
                  class="column is-4"
                >
                  <div class="box shadow-soft blog-card">
                    <h3 class="title is-5 mb-2">
                      {{ post.title }}
                    </h3>

                    <p class="has-text-grey blog-excerpt">
                      {{ post.description }}
                    </p>

                    <o-button
                      class="mt-4"
                      variant="light"
                      size="small"
                      tag="a"
                      :href="post.path"
                    >
                      Read →
                    </o-button>
                  </div>
                </div>
              </div>

              <div class="has-text-centered mt-5">
                <o-button
                  variant="primary"
                  tag="a"
                  :href="`/${locale}/blog`"
                >
                  View all articles
                </o-button>
              </div>
            </div>
          </section>
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

const { data: posts } = await useAsyncData(
  () => `blog-preview-${locale.value}`,
  async () => {
    const all = await queryCollection('content').limit(200).all()

    return all
      .filter(p => p.stem?.startsWith(`${locale.value}/blog/`))
      .slice(0, 3)
  },
  { watch: [locale] }
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

/* if you don't already have it globally */
.h-full {
  height: 100%;
}
.pillar-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.mt-auto {
  margin-top: auto;
}
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
</style>
