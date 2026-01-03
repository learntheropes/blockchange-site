<template>
  <main v-if="home">
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
    <section class="section">
      <div class="container">
        <h2 class="title is-4">
          {{ home.meta.architectureLinksTitle }}
        </h2>

        <div class="columns is-variable is-6 mt-4">
          <div v-for="(p, i) in home.meta.pillars" :key="i" class="column is-4">
            <div class="box shadow-soft pillar-card">
              <h3 class="title is-5 mb-2">{{ p.title }}</h3>
              <p class="has-text-grey mb-4">{{ p.text }}</p>

              <o-button variant="light" tag="a" :href="p.href" class="mt-auto">
                {{ home.meta.learnMore }}
              </o-button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CONTACT / BOOKING -->
    <section class="section">
      <div class="container">
        <div class="box shadow-soft">
          <h2 class="title is-4">
            {{ home.meta.contactTitle }}
          </h2>

          <p class="has-text-grey mb-4">
            {{ home.meta.contactIntro }}
          </p>

          <IndexContacts />
        </div>
      </div>
    </section>

    <!-- BLOG PREVIEW -->
    <section class="section">
      <div class="container">
        <h2 class="title is-4 mb-4">
          {{ home.meta.latestInsightsTitle }}
        </h2>

        <div class="columns is-multiline is-centered is-variable is-6">
          <div v-for="post in posts" :key="post.path" class="column is-4">
            <div class="box shadow-soft blog-card">
              <h3 class="title is-5 mb-2">
                {{ post.title }}
              </h3>

              <p class="has-text-grey blog-excerpt">
                {{ post.description }}
              </p>

              <o-button class="mt-4" variant="light" size="small" tag="a" :href="post.path">
                {{ home.meta.readMore }}
              </o-button>
            </div>
          </div>
        </div>

        <div class="has-text-centered mt-5">
          <o-button variant="primary" tag="a" :href="`/${locale}/blog`">
            {{ home.meta.viewAllArticles }}
          </o-button>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
const { locale } = useI18n()
const route = useRoute()

const { data: home } = await useAsyncData(
  () => `home-${locale.value}`,
  () =>
    queryCollection('content')
      .path(`/${locale.value}/home`)
      .first(),
  {
    watch: [locale]
  }
)

const { data: posts } = await useAsyncData(
  () => `blog-preview-${locale.value}`,
  async () => {
    const all = await queryCollection('content').limit(200).all()

    const items = (all || [])
      .filter(x => x?.stem?.startsWith(`${locale.value}/blog/`))
      .map(x => ({
        path: x.path,
        title: x.title,
        description: x.description,
        stem: x.stem
      }))

    items.sort((a, b) => (a.stem < b.stem ? 1 : -1))

    return items.slice(0, 3)
  },
  {
    watch: [locale]
  }
)
</script>

<style scoped>
.shadow-soft {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}

.pillar-card {
  display: flex;
  flex-direction: column;
  height: 100%;
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

.mt-auto {
  margin-top: auto;
}
</style>
