<template>
    <div>
        <ConnectingPane v-if="!connected">
        </ConnectingPane>

        <div v-if="connected">
            <button @click="createGame">Create new Game</button>
            <hr>

            Game ID: <input type="text" v-model="joinGameId">
            <button @click="joinGame">Join Existing Game</button>
        </div>
    </div>
</template>

<script>
import ConnectingPane from "@/components/ConnectingPane.vue";

export default {
    inject: ["$ioSocket"],

    data() {
        return {
            joinGameId: '',
            connected: false
        };
    },
    created() {
        this.$ioSocket.on("connect", () => {
            this.reset();
            this.connected = true;
        });

        this.$ioSocket.on("disconnect", () => {
            this.reset();
        });

        this.$ioSocket.on("gameCreated", (arg) => {
            this.$router.push(`/game/${arg.game}`);
        });
    },

    mounted() {
        this.$ioSocket.connect();
    },

    unmounted() {
        this.$ioSocket.disconnect();
    },

    methods: {
        reset() {
            this.connected = false;
        },

        createGame() {
            this.$ioSocket.emit("createGame");
        },

        joinGame() {
            this.$router.push(`/game/${this.joinGameId}`);
        }
    },

    components: { ConnectingPane }
}
</script>

<style>
</style>
