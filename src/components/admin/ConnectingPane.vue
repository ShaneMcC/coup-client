<template>
    <div>
        <form @submit.prevent="$emit('connect')">
            Admin token: <input type="password" :value="adminToken" @input="this.$emit('update:adminToken', $event.target.value)">

            <button type="submit">Connect</button>
        </form>

        <div v-if="connectErrorMessage">
            <strong>Connection Error:</strong> {{ connectErrorMessage }}
        </div>
    </div>
</template>

<script>

export default {
    props: ['connectErrorMessage', 'adminToken'],
}
</script>

<style>
</style>
