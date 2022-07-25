<template>
  <div>
    <button @click="connect">Connect</button>
    <hr>
    Connecting to server...
  </div>
</template>

<script>

export default {
  inject: ['$ioSocket'],

  methods: {
    connect() {
      this.$ioSocket.connect();
    },
  }
}
</script>

<style>
</style>
