<script setup>
const i18n = useI18n({ useScope: 'global' })

const normalize = (val) => {
  if (Array.isArray(val)) return val.map(normalize)
  if (val && typeof val === 'object') {
    if ('type' in val && 'loc' in val) return i18n.rt(val)
    return Object.fromEntries(Object.entries(val).map(([k, v]) => [k, normalize(v)]))
  }
  return val
}

const services = useState(`i18n-services-${i18n.locale.value}`, () => {
  const m = i18n.getLocaleMessage(i18n.locale.value)
  return normalize(m?.services ?? [])
})

watch(() => i18n.locale.value, (loc) => {
  const m = i18n.getLocaleMessage(loc)
  services.value = normalize(m?.services ?? [])
})

</script>


<template>
<div class="block">
  <h2 class="title is-5 has-text-primary" id="services">{{  $t("servicesTitle") }}</h2>
  <ul class="columns is-align-items-stretch is-multiline" style="list-style: none; padding-left: 0;">
    <div v-for="(service, index) in services" :key="index" class="column is-flex is-flex-direction-column is-one-third">
      <li class="card is-flex is-flex-direction-column is-flex-grow-1">
        <header class="card-header">
          <h3 class="card-header-title">{{ service.title }}</h3>
        </header>
        <div class="card-content is-flex-grow-1">
          <div class="content">{{ service.description }}</div>
        </div>
        <footer class="card-footer" style="margin-top:auto">
          <div class="card-footer-item">{{ service.price }}</div>
        </footer>
      </li>
    </div>
  </ul>
</div>
</template>
