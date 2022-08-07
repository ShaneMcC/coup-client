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
@import '@/assets/_variables.scss';

html {
  --assassin-background-color: #{$assassin-background-color};
  --assassin-color: #{$assassin-color};
  --ambassador-background-color: #{$ambassador-background-color};
  --ambassador-color: #{$ambassador-color};
  --captain-background-color: #{$captain-background-color};
  --captain-color: #{$captain-color};
  --contessa-background-color: #{$contessa-background-color};
  --contessa-color: #{$contessa-color};
  --duke-background-color: #{$duke-background-color};
  --duke-color: #{$duke-color};
}

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

  .modal-content {
    background-color: #373737;

    .modal-body {
      max-width: 100%;
      overflow-x: auto;
    }
  }

  .table {
    color: white;
  }
}
</style>

<style lang="scss">
// @import '~bootstrap/dist/css/bootstrap.css';
@import "~bootstrap/scss/bootstrap";
</style>
