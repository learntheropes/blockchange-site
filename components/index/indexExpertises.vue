<script setup>
const i18n = useI18n({ useScope: 'global' })
const route = useRoute()
const key = computed(() => `${route.path}-${locale.value}`)
const { data } = await useAsyncData( key + 'expertise', () => queryCollection('content').path(`/${i18n.locale.value}/expertise`).first(), { watch: [i18n.locale, () => route.path] })

const normalize = (val) => {
  if (Array.isArray(val)) return val.map(normalize)
  if (val && typeof val === 'object') {
    if ('type' in val && 'loc' in val) return i18n.rt(val)
    return Object.fromEntries(Object.entries(val).map(([k, v]) => [k, normalize(v)]))
  }
  return val
}

const expertises = useState(`i18n-expertises-${i18n.locale.value}`, () => {
  const m = i18n.getLocaleMessage(i18n.locale.value)
  return normalize(m?.expertises ?? [])
})

watch(() => i18n.locale.value, (loc) => {
  const m = i18n.getLocaleMessage(loc)
  expertises.value = normalize(m?.expertises ?? [])
})
</script>


<template>
<div class="block">
  <h2 class="title is-5 has-text-primary" id="expertises">{{  $t("expertisesTitle") }}</h2>
  <ContentRenderer :value="data" class="content" />
  <ul class="columns is-align-items-stretch is-multiline" style="list-style: none; padding-left: 0;">
    <div v-for="(expertise, index) in expertises" :key="index" class="column is-flex is-flex-direction-column is-one-third">
      <li class="card is-flex is-flex-direction-column is-flex-grow-1">
        <header class="card-header">
          <h3 class="card-header-title">{{ expertise.title }}</h3>
        </header>
        <div class="card-content is-flex-grow-1">
          <div class="content">{{ expertise.description }}</div>
        </div>
      </li>
    </div>
  </ul>
</div>
</template>