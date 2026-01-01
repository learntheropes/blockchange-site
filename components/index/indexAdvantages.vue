<script setup>
const i18n = useI18n({ useScope: 'global' })
const localePath = useLocalePath()

const normalize = (val) => {
  if (Array.isArray(val)) return val.map(normalize)
  if (val && typeof val === 'object') {
    if ('type' in val && 'loc' in val) return i18n.rt(val)
    return Object.fromEntries(Object.entries(val).map(([k, v]) => [k, normalize(v)]))
  }
  return val
}

const advantages = useState(`i18n-advantages-${i18n.locale.value}`, () => {
  const m = i18n.getLocaleMessage(i18n.locale.value)
  return normalize(m?.advantages ?? [])
})

watch(() => i18n.locale.value, (loc) => {
  const m = i18n.getLocaleMessage(loc)
  advantages.value = normalize(m?.advantages ?? [])
})

const taxAnchor = computed(() =>
  advantages.value[0]
    ? '#' + advantages.value[0].title.toLowerCase().replace(/\s+/g, '-')
    : ''
)

const complianceAnchor = computed(() =>
  advantages.value[1]
    ? '#' + advantages.value[1].title.toLowerCase().replace(/\s+/g, '-')
    : ''
)

const energyAnchor = computed(() =>
  advantages.value[2]
    ? '#' + advantages.value[2].title.toLowerCase().replace(/\s+/g, '-')
    : ''
)

const taxTo = computed(() => ({
  path: localePath('/advantages/'),
  hash: taxAnchor.value
}))

const complianceTo = computed(() => ({
  path: localePath('/advantages'),
  hash: complianceAnchor.value,
}))

const energyTo = computed(() => ({
  path: localePath('/advantages'),
  hash: energyAnchor.value,
}))

const to = computed(() => [taxTo.value, complianceTo.value, energyTo.value])
</script>

<template>
<div class="block">
  <h2 class="title is-5 has-text-primary" id="advantages">{{ $t('advantagesTitle') }}</h2>
  <div class="columns is-align-items-stretch">
    <div v-for="(advantage, index) in advantages" :key="index" class="column is-flex is-flex-direction-column is-one-third">
      <div class="card is-flex is-flex-direction-column is-flex-grow-1">
        <header class="card-header">
          <h3 class="card-header-title">{{ advantage.title }}</h3>
        </header>
        <div class="card-content is-flex-grow-1">
          <div class="content">{{ advantage.description }}</div>
        </div>
        <footer class="card-footer" style="margin-top:auto">
          <NuxtLink :to="to[index]" class="card-footer-item">{{ $t('readHere') }}</NuxtLink>
        </footer>
      </div>
    </div>
  </div>
</div>
</template>