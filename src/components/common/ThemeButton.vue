<template>
    <div class="themeButton">
        <div v-if="false">
            <!--
                Based on:

                https://dev.to/tqbit/create-your-own-dark-mode-toggle-component-with-vue-js-1284
            -->
        </div>

        <input @change="toggleTheme" id="checkbox" type="checkbox" class="switch-checkbox" />
        <label for="checkbox" class="switch-label">
            <span>🌙</span>
            <span>☀️</span>
            <div class="switch-toggle" :class="{ 'switch-toggle-checked': userTheme === 'dark-theme' }"></div>
        </label>
    </div>
</template>

<script>
export default {
    mounted() {
        const initUserTheme = this.getTheme() || this.getMediaPreference();
        this.setTheme(initUserTheme);

        window.addEventListener('storage', (e) => {
            if (e.key == 'user-theme') {
                var newTheme = this.getTheme();
                if (this.userTheme != newTheme) {
                    this.setTheme(newTheme);
                }
            }
        });
    },

    data() {
        return {
            userTheme: "light-theme",
        };
    },

    methods: {
        toggleTheme() {
            if (this.getTheme() === "light-theme") {
                this.setTheme("dark-theme");
            } else {
                this.setTheme("light-theme");
            }
        },

        getTheme() {
            return localStorage.getItem("user-theme");
        },

        setTheme(theme) {
            localStorage.setItem("user-theme", theme);
            this.userTheme = theme;
            document.documentElement.className = theme;
        },

        getMediaPreference() {
            const hasDarkPreference = window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;
            if (hasDarkPreference) {
                return "dark-theme";
            } else {
                return "light-theme";
            }
        },
    },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
html {
    .themeButton {
        --background-color-primary: #ebebeb;
        --background-color-secondary: #fafafa;
        --accent-color: #cacaca;
        --text-primary-color: #222;
        --element-size: 3rem;
    }
}

.themeButton {
    display: inline-block;

    .switch-checkbox {
        display: none;
    }

    .switch-label {
        box-sizing: content-box;
        align-items: center;
        background: var(--text-primary-color);
        border: calc(var(--element-size) * 0.025) solid var(--accent-color);
        border-radius: var(--element-size);
        cursor: pointer;
        display: flex;
        font-size: calc(var(--element-size) * 0.3);
        height: calc(var(--element-size) * 0.35);
        position: relative;
        padding: calc(var(--element-size) * 0.1);
        transition: background 0.5s ease;
        justify-content: space-between;
        width: var(--element-size);
        z-index: 1;
    }

    .switch-toggle {
        position: absolute;
        background-color: var(--background-color-primary);
        border-radius: 50%;
        top: calc(var(--element-size) * 0.07);
        left: calc(var(--element-size) * 0.07);
        height: calc(var(--element-size) * 0.4);
        width: calc(var(--element-size) * 0.4);
        transform: translateX(0);
        transition: transform 0.3s ease, background-color 0.5s ease;
    }

    .switch-toggle-checked {
        transform: translateX(calc(var(--element-size) * 0.6)) !important;
    }
}
</style>
