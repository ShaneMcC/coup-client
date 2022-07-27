<template>
    <div>
        <form class="form" @submit.prevent="$emit('connect')">
            <div class="d-flex flex-row align-items-center flex-wrap">
                <label for="adminToken">Admin token:</label>
                <input id="adminToken" class="form-control w-auto mx-2" type="password" :value="adminToken" @input="this.$emit('update:adminToken', $event.target.value)">

                <button class="btn btn-sm btn-primary" type="submit">Connect</button>
            </div>
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
