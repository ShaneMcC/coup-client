<template>
    <div>
        <form @submit.prevent="$emit('connect', adminToken)">
            Admin token: <input v-model="adminToken">

            <button type="submit">Connect</button>
        </form>

        <div v-if="connectErrorMessage">
            <strong>Connection Error:</strong> {{ connectErrorMessage }}
        </div>
    </div>
</template>

<script>

export default {
    props: ['connectErrorMessage'],

    data() {
        return {
            adminToken: '',
        };
    },
}
</script>

<style>
</style>
