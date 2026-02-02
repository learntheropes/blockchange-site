<script setup>
import { computed } from 'vue'

const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const availableLocales = computed(() =>
  locales.value.filter(i => i.code !== locale.value)
)

const socials = [
  { name: 'Youtube', href: 'https://www.youtube.com/@blockchange_expert' },
  { name: 'Linkedin', href: 'https://www.linkedin.com/company/blockchange-expert' },
  { name: 'Telegram', href: 'https://t.me/blockchange_expert' },
  { name: 'X', href: 'https://x.com/BlockchangeExp' }
]
</script>

<template>
  <footer class="footer">
    <div class="container">
      <nav class="level">
        <div class="level-left">
          <div class="level-item">
            <div class="buttons">
              <OButton v-for="social in socials" :key="social.name" tag="a" :href="social.href" variant="primary"
                inverted target="_blank" rel="noopener noreferrer">
                {{ social.name }}
              </OButton>
            </div>
          </div>
        </div>

        <div class="level-right">
          <div class="level-item">
            <div class="buttons">
              <OButton v-for="l in availableLocales" :key="l.code" tag="router-link" :to="switchLocalePath(l.code)"
                variant="primary" inverted>
                {{ l.name }}
              </OButton>
            </div>
          </div>
        </div>
      </nav>
    </div>
  </footer>
</template>
