<template>
    <div>
        <ConnectingPane v-if="!connected" :connectErrorMessage="connectErrorMessage">
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
import ConnectingPane from "@/components/common/ConnectingPane.vue";

export default {
    inject: ["$ioSocket"],

    data() {
        return {
            joinGameId: '',
            connectErrorMessage: '',
            connected: false
        };
    },
    created() {
        this.$ioSocket.on("connect", this.handleConnect);
        this.$ioSocket.on("connect_error", this.handleConnectError);
        this.$ioSocket.on("disconnect", this.handleDisconnect);
        this.$ioSocket.on("gameCreated", this.handleGameCreated);
    },

    mounted() {
        this.$ioSocket.connect();
    },

    unmounted() {
        this.$ioSocket.disconnect();

        this.$ioSocket.off("connect", this.handleConnect);
        this.$ioSocket.off("connect_error", this.handleConnectError);
        this.$ioSocket.off("disconnect", this.handleDisconnect);
        this.$ioSocket.off("gameCreated", this.handleGameCreated);
    },

    methods: {
        handleConnect() {
            this.reset();
            this.connected = true;
        },

        handleConnectError(err) {
            this.connectErrorMessage = err.message;
        },

        handleDisconnect() {
            this.reset();
        },

        handleGameCreated(arg) {
            this.$router.push(`/game/${arg.game}`);
        },

        reset() {
            this.connected = false;
            this.connectErrorMessage = '';
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
