<template>
    <div class="container text-center">
        <h2>Rules and Gameplay</h2>
        <RulesPane :variants="variants"></RulesPane>

        <component :is="'style'">
            footer, nav { display: none !important; }
            body {
                padding-top: 0 !important;
                margin-bottom: 0 !important;
            }
        </component>
    </div>
</template>

<script>
import RulesPane from "@/components/common/RulesPane.vue";

export default {
    components: { RulesPane },

    computed: {
        variants() {
            try {
                return JSON.parse(this.$route.query?.variants);
            } catch (e) {
                console.log(e);
                return {};
            }
        },
    }
}
</script>
