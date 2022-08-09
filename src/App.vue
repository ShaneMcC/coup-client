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

  .offcanvas {
    background-color: #373737;
  }

  .modal-content {
    background-color: #373737;
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

@mixin influence-colourings($influence, $background-color, $color, $highlightColour: white, $highlightPercentage: 25%) {

  .#{$influence} {
    background-color: $background-color;
    color: $color;
  }

  button.#{$influence},
  a.#{$influence} {

    &:hover,
    &:active {
      background-color: #{mix($highlightColour, $background-color, $highlightPercentage)};
      color: $color;
    }
  }
}

@include influence-colourings('ASSASSIN', $assassin-background-color, $assassin-color, $highlightPercentage: 15%);
@include influence-colourings('AMBASSADOR', $ambassador-background-color, $ambassador-color);
@include influence-colourings('CAPTAIN', $captain-background-color, $captain-color);
@include influence-colourings('CONTESSA', $contessa-background-color, $contessa-color);
@include influence-colourings('DUKE', $duke-background-color, $duke-color, $highlightColour: black);
</style>