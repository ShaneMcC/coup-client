<template>
  <div>
    <app-header id="appHeader"></app-header>

    <div id="appContent" class="container-fluid">
      <div class="row">
        <main class="col-sm-12 pt-3">
          <router-view></router-view>
        </main>
      </div>
    </div>

    <app-footer id="appFooter"></app-footer>

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
  .text-reset {
    color: white !important;
  }

  body {
    background-color: #373737;

    .offcanvas,
    .modal-content {
      background-color: #373737;
    }

    .offcanvas-header,
    .modal-header {
      .btn-close {
        filter: invert(1) grayscale(100%) brightness(200%);
      }
    }

    .table {
      color: white;
    }

    #appContent,
    #appFooter {
      color: white;

      a,
      a:focus,
      a:hover {
        color: #fff
      }
    }
  }
}
</style>

<style lang="scss">
@use 'bootstrap/dist/css/bootstrap.css';
// @import "~bootstrap/scss/bootstrap";
</style>

<style lang="scss">
@use '@/assets/_variables.scss' as vars;
@use "sass:color";

html {
  --assassin-background-color: #{vars.$assassin-background-color};
  --assassin-color: #{vars.$assassin-color};
  --ambassador-background-color: #{vars.$ambassador-background-color};
  --ambassador-color: #{vars.$ambassador-color};
  --captain-background-color: #{vars.$captain-background-color};
  --captain-color: #{vars.$captain-color};
  --contessa-background-color: #{vars.$contessa-background-color};
  --contessa-color: #{vars.$contessa-color};
  --duke-background-color: #{vars.$duke-background-color};
  --duke-color: #{vars.$duke-color};
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
      background-color: #{color.mix($highlightColour, $background-color, $highlightPercentage)};
      color: $color;
    }
  }
}

@include influence-colourings('ASSASSIN', vars.$assassin-background-color, vars.$assassin-color, $highlightPercentage: 15%);
@include influence-colourings('AMBASSADOR', vars.$ambassador-background-color, vars.$ambassador-color);
@include influence-colourings('CAPTAIN', vars.$captain-background-color, vars.$captain-color);
@include influence-colourings('CONTESSA', vars.$contessa-background-color, vars.$contessa-color);
@include influence-colourings('DUKE', vars.$duke-background-color, vars.$duke-color, $highlightColour: black);
</style>
