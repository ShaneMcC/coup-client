<template>
    <div v-for="(alert, id) in alerts" :key="id" :class="'alert alert-dismissible alert-' + alert.type" role="alert">
        {{ alert.message }}
        <button type="button" class="btn-close" @click="$emit('removeAlert', id)" aria-label="Close"></button>
    </div>
</template>

<script>

export default {
  props: ['alerts'],
}
</script>

<style>
</style>
