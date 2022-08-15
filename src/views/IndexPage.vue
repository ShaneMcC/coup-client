<template>
    <div class="container text-center">
        <AlertsPane @removeAlert="removeAlert" :alerts="alerts"></AlertsPane>

        <h1>Welcome to Coup Online</h1>

        <div class="blurb">
            <p>
                This website will allow you to play the social deduction game <a href="https://board-games-galore.fandom.com/wiki/Coup">Coup</a>
                with up to 10 people.
                <br>
                <small>
                    (For 1-6 players, 3 copies of each card are in the deck. For 7/8 people, 1 extra copy of each card is added to the game, with 9/10 2 extra copies are added.)
                </small>
            </p>
            <p>
                It is primarily designed for play with friends while on voice chat (such as Discord), but also can be played with just the
                in-game chat features, or in person with all players playing on mobile.
            </p>
            <p>
                All the core game rules are implemented and should be fully accurate, but if there are any bugs or issues then you can contact
                <strong>Dataforce</strong> on Quakenet IRC, <strong>Dataforce#4726</strong> on Discord,
                <a href="https://github.com/ShaneMcC/coup-server/issues/new">raise an issue</a> on github, or drop me an
                <a href="mailto:coupgame@dataforce.org.uk">email</a>.
            </p>
        </div>

        <hr>

        <ConnectingPane v-if="!connected" :connectErrorMessage="connectErrorMessage">
        </ConnectingPane>

        <div v-if="connected">
            <div v-if="gameCreationEnabled">
                <h2>Create a new game</h2>
                <button class="btn btn-sm btn-success" @click="createGame">Create Game</button>
                <hr>
            </div>

            <h2>Join an existing game</h2>
            <form class="form" @submit.prevent="joinGame">
                <div class="d-flex flex-row align-items-center flex-wrap justify-content-center">
                    <label for="joinGameID" class="mt-2">Game ID:</label>
                    <input id="joinGameID" class="form-control w-auto mx-2 mt-2" v-model="joinGameId">

                    <button class="btn btn-sm btn-primary mt-2" type="submit">Join Game</button>
                </div>
            </form>
        </div>

        <hr>
        <h2>Rules and Gameplay</h2>
        <RulesPane></RulesPane>
    </div>
</template>

<script>
import ConnectingPane from "@/components/common/ConnectingPane.vue";
import AlertsPane from "@/components/common/AlertsPane.vue";
import RulesPane from "@/components/common/RulesPane.vue";

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

    components: { ConnectingPane, AlertsPane, RulesPane }
}
</script>

<style>
</style>
