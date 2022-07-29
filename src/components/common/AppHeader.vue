<template>
    <nav class="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
        <div class="container-fluid">
            <a class="navbar-brand" href="/">{{ $appConfig.siteName }} <span class="d-none d-md-inline">:: {{ titleSuffix }}</span></a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar" aria-controls="navbar" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbar">
                <ul class="navbar-nav me-auto mb-lg-0">
                    <li class="nav-item">
                        <router-link class="nav-link" :class="{ active: this.$route.name == 'Home' }" to="/">Home</router-link>
                    </li>
                </ul>

                <ul class="navbar-nav ms-auto mb-lg-0">
                    <li class="nav-item">
                        <router-link class="nav-link" :class="{ active: this.$route.name == 'Admin' }" to="/admin">Admin</router-link>
                    </li>
                    <li>
                        <ThemeButton></ThemeButton>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script>
import ThemeButton from "@/components/common/ThemeButton.vue";

export default {
    inject: ['$appConfig'],

    computed: {
        titleSuffix() {
            var suffix = this.$route.name;

            if (this.$route.params.gameId) {
                suffix += ' :: ' + this.$route.params.gameId
            }

            return suffix;
        }
    },

    components: { ThemeButton },
}
</script>
