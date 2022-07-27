<template>
    <div>
        <AlertsPane @removeAlert="removeAlert" :alerts="alerts"></AlertsPane>

        <ConnectingPane v-if="!connected" :connectErrorMessage="connectErrorMessage">
        </ConnectingPane>

        <div v-if="gameExists">
            <PreGamePane v-if="connected && !inGame" v-model:playerName="playerName" :gameID="myGameID">
            </PreGamePane>

            <GamePane v-if="connected && inGame" :myGameID="myGameID" :initialEvents="gameEvents">
            </GamePane>
        </div>

        <div v-if="!gameExists && gameStateKnown">
            <strong>Error:</strong> Game does not exist

            <button v-if="connected" class="btn btn-sm btn-success" @click="checkExists">Retry</button>
        </div>
    </div>
</template>

<script>
import ConnectingPane from "@/components/common/ConnectingPane.vue";
import PreGamePane from "@/components/game/PreGamePane.vue";
import GamePane from "@/components/game/GamePane.vue";
import AlertsPane from "@/components/common/AlertsPane.vue";

import { uniqueNamesGenerator, adjectives as adjectiveList, colors as colourList, animals as animalList } from 'unique-names-generator';

export default {
    inject: ["$ioSocket"],

    data() {
        return {
            playerName: '',
            connectErrorMessage: '',

            connected: false,
            inGame: false,
            gameExists: false,
            gameStateKnown: false,
            gameJoinAttempted: false,

            myPlayerID: this.$route.params.playerId,
            myGameID: this.$route.params.gameId,

            gameEvents: [],
            alerts: [],
        };
    },
    created() {
        this.$ioSocket.on("connect", this.handleConnect);
        this.$ioSocket.on("connect_error", this.handleConnectError);
        this.$ioSocket.on("disconnect", this.handleDisconnect);
        this.$ioSocket.on("gameJoined", this.handleGameJoined);
        this.$ioSocket.on("handleGameEvent", this.handleGameEvent);
        this.$ioSocket.on("gameExists", this.handleGameExists);
        this.$ioSocket.on("gameDoesNotExist", this.handleGameDoesNotExist);
        this.$ioSocket.on("gameRemoved", this.handleGameRemoved);
        this.$ioSocket.on("refreshGame", this.handleRefreshGame);
        this.$ioSocket.on("commandError", this.handleCommandError);
        this.$ioSocket.on("actionError", this.handleCommandError);
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
        this.$ioSocket.off("gameJoined", this.handleGameJoined);
        this.$ioSocket.off("handleGameEvent", this.handleGameEvent);
        this.$ioSocket.off("gameExists", this.handleGameExists);
        this.$ioSocket.off("gameDoesNotExist", this.handleGameDoesNotExist);
        this.$ioSocket.off("gameRemoved", this.handleGameRemoved);
        this.$ioSocket.off("refreshGame", this.handleRefreshGame);
        this.$ioSocket.off("commandError", this.handleCommandError);
        this.$ioSocket.off("actionError", this.handleCommandError);
        this.$ioSocket.off("error", this.handleCommandError);
    },

    methods: {
        handleConnect() {
            this.reset();
            this.connected = true;
            this.checkExists();
        },

        checkExists() {
            this.$ioSocket.emit('checkGame', this.myGameID);
        },

        handleConnectError(err) {
            this.connectErrorMessage = err.message;
        },

        handleDisconnect() {
            this.reset();
        },

        handleGameJoined(arg) {
            this.myPlayerID = arg.playerID;
            this.myGameID = arg.gameID;

            this.inGame = true;
            if (this.myPlayerID != undefined) {
                this.$router.push(`/game/${this.myGameID}/${this.myPlayerID}`);
            } else {
                this.$router.push(`/game/${this.myGameID}`);
            }
        },

        handleGameExists(event) {
            if (!this.gameJoinAttempted && event.game == this.myGameID) {
                this.gameExists = true;
                this.gameStateKnown = true;
                this.gameJoinAttempted = true;

                if (this.myPlayerID) {
                    this.$ioSocket.emit("rejoinGame", this.myGameID, this.myPlayerID);
                } else if (!event.joinable) {
                    this.$ioSocket.emit("spectateGame", this.myGameID);
                }
            }
        },

        handleGameDoesNotExist(event) {
            if (event.game == this.myGameID) {
                this.gameExists = false;
                this.gameStateKnown = true;
            }
        },

        handleGameEvent(event) {
            this.gameEvents.push(event);
        },

        handleGameRemoved(event) {
            if (event.game == this.myGameID) {
                this.reset();
                this.connected = true;
                this.gameStateKnown = true;
            }
        },

        handleRefreshGame(event) {
            if (event.game == this.myGameID) {
                this.reset();
                this.connected = true;
                this.checkExists();
            }
        },

        handleCommandError(event) {
            this.alerts.push({type: 'danger', message: event.error});
        },

        removeAlert(alertId) {
            this.alerts.splice(alertId, 1);
        },

        reset() {
            this.connected = false;
            this.inGame = false;
            this.gameStarted = false;
            this.gameEvents = [];
            this.gameExists = false;
            this.gameStateKnown = false;
            this.gameJoinAttempted = false;

            this.playerName = uniqueNamesGenerator({ dictionaries: [[...adjectiveList, ...colourList], animalList], length: 2, separator: '', style: 'capital' });
            this.myPlayerID = this.$route.params.playerId;
            this.myGameID = this.$route.params.gameId;

            this.connectErrorMessage = '';
        },
    },

    components: { ConnectingPane, PreGamePane, GamePane, AlertsPane }
}
</script>

<style>
</style>
