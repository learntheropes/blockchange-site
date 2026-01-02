<template>
  <div>
    <div class="columns is-multiline is-variable is-3">
      <div class="column is-narrow">
        <o-button variant="primary" size="large" tag="a" href="/#book">
          {{ $t('home.book.bookPaid') }}
        </o-button>
      </div>
      <div class="column is-narrow">
        <o-button variant="primary" size="large" tag="a" href="/#book">
          {{ $t('home.book.bookFree') }}
        </o-button>
      </div>
      <div class="column is-narrow">
        <o-button variant="text" size="large" tag="a" href="/#explanation">
          {{ $t('home.book.learnMore') }}
        </o-button>
      </div>
    </div>
  </div>
</template>
