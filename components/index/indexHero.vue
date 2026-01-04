<template>
  <section class="hero is-fullheight is-light">
    <div class="hero-body">
      <div class="container">
        <div class="columns is-vcentered is-variable is-8">
          <div class="column is-9">
            <h1 class="title is-2">{{ home.meta.heroHeadline }}</h1>
            <p class="subtitle is-4 has-text-grey-dark">{{ home.meta.heroSubheadline }}</p>
            <div class="content mb-5">
              <ul>
                <li v-for="(b, i) in home.meta.heroBullets" :key="i">
                  {{ b }}
                </li>
              </ul>
            </div>
            <IndexBook />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  home: { type: Object, required: true }
})
</script>
