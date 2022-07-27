<template>
  <div>
    <button @click="connect">Connect</button>
    <hr>
    Connecting to {{ $appConfig.siteName }} server...

    <div v-if="connectErrorMessage">
      <strong>Connection Error:</strong> {{ connectErrorMessage }}
    </div>
  </div>
</template>

<script>

export default {
  inject: ['$ioSocket', '$appConfig'],

  props: ['connectErrorMessage'],

  methods: {
    connect() {
      this.$ioSocket.connect();
    },
  }
}
</script>

<style>
</style>
