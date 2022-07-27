<template>
    <div>
        <AlertsPane @removeAlert="removeAlert" :alerts="alerts"></AlertsPane>

        <ConnectingPane v-if="!connected" :connectErrorMessage="connectErrorMessage">
        </ConnectingPane>

        <div v-if="connected">
            <div v-if="gameCreationEnabled">
                <button class="btn btn-sm btn-success" @click="createGame">Create new Game</button>
                <hr>
            </div>

            <form class="form" @submit.prevent="joinGame">
                <div class="d-flex flex-row align-items-center flex-wrap">
                    <label for="joinGameID">Game ID:</label>
                    <input id="joinGameID" class="form-control w-auto mx-2" v-model="joinGameId">

                    <button class="btn btn-sm btn-primary" type="submit">Join Existing Game</button>
                </div>
            </form>

        </div>
    </div>
</template>

<script>
import ConnectingPane from "@/components/common/ConnectingPane.vue";
import AlertsPane from "@/components/common/AlertsPane.vue";

export default {
    inject: ["$ioSocket"],

    data() {
        return {
            joinGameId: '',
            connectErrorMessage: '',
            connected: false,
            gameCreationEnabled: false,
            alerts: [],
        };
    },
    created() {
        this.$ioSocket.on("connect", this.handleConnect);
        this.$ioSocket.on("connect_error", this.handleConnectError);
        this.$ioSocket.on("disconnect", this.handleDisconnect);
        this.$ioSocket.on("gameCreated", this.handleGameCreated);
        this.$ioSocket.on("gameCreationEnabled", this.handleGameCreationEnabled);
        this.$ioSocket.on("commandError", this.handleCommandError);
        this.$ioSocket.on("error", this.handleCommandError);
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
        this.$ioSocket.off("gameCreationEnabled", this.handleGameCreationEnabled);
        this.$ioSocket.off("commandError", this.handleCommandError);
        this.$ioSocket.off("error", this.handleCommandError);
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

        handleGameCreationEnabled(arg) {
            this.gameCreationEnabled = arg.value;
        },

        handleCommandError(event) {
            this.alerts.push({ type: 'danger', message: event.error });
        },

        removeAlert(alertId) {
            this.alerts.splice(alertId, 1);
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

    components: { ConnectingPane, AlertsPane }
}
</script>

<style>
</style>
