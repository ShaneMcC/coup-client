<template>
  <div>
    <app-header></app-header>

    <div class="container-fluid">
      <div class="row" v-if="showSidebar">
        <nav class="col-sm-3 col-md-2 hidden-xs-down bg-light sidebar" id="sidebar">
        </nav>
        <main class="col-sm-9 offset-sm-3 col-md-10 offset-md-2 pt-3">
          <router-view></router-view>
        </main>
      </div>

      <div class="row" v-else>
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

<style>
html {
  position: relative;
  min-height: 100%;
}

body {
  padding-top: 50px;
  margin-bottom: 60px;
}
</style>
