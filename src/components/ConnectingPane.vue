<template>
  <div>
    <button @click="connect">Connect</button>
    <hr>
    Connecting to {{ $appConfig.siteName }} server...
  </div>
</template>

<script>

export default {
  inject: ['$ioSocket', '$appConfig'],

  methods: {
    connect() {
      this.$ioSocket.connect();
    },
  }
}
</script>

<style>
</style>
