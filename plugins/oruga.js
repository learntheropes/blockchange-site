import { OButton, Config } from '@oruga-ui/oruga-next';
import { bulmaConfig } from "@oruga-ui/theme-bulma";

const customConfig = Object.assign(bulmaConfig, {
  notification: {
    ...bulmaConfig.notification,
    position: 'bottom'
  }
});

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('OButton', OButton);
  nuxtApp.vueApp.use(Config, customConfig);
});