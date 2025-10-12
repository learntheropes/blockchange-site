export default {
  scrollBehavior(to, from, savedPosition) {
    console.log('Navigating from', from.fullPath, 'to', to.fullPath);
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      };
    }
    return savedPosition || { top: 0 };
  },
};
