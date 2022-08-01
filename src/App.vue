<template>
  <div>
    <app-header></app-header>

    <div class="container-fluid">
      <div class="row">
        <main class="col-sm-12 pt-3">
          <router-view></router-view>
        </main>
      </div>
    </div>

    <app-footer></app-footer>

  </div>
</template>

<script>

import Header from '@/components/common/AppHeader.vue';
import Footer from '@/components/common/AppFooter.vue';

export default {
  components: {
    appHeader: Header,
    appFooter: Footer,
  },
}
</script>

<style lang="scss">
html {
  position: relative;
  min-height: 100%;

  body {
    padding-top: 50px;
    margin-bottom: 60px;
  }
}

html.dark-theme {
  body {
    background-color: #373737;
    color: white;

    a,
    a:focus,
    a:hover {
      color: #fff
    }
  }
}

// @import '~bootstrap/dist/css/bootstrap.css';
@import "~bootstrap/scss/bootstrap";
</style>
