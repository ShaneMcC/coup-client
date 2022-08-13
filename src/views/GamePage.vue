<template>
    <div>
        <AlertsPane @removeAlert="removeAlert" :alerts="alerts"></AlertsPane>

        <ConnectingPane v-if="!connected" :connectErrorMessage="connectErrorMessage">
        </ConnectingPane>

        <div v-if="gameExists">
            <PreGamePane v-if="connected && !gameStarted && (myPlayerID == undefined)" :showSpectateButton="!inGame" v-model:playerName="playerName" :gameID="myGameID">
            </PreGamePane>

            <GamePane :key="myGameID + '/' + myPlayerID" v-if="connected && inGame" :myGameID="myGameID" :originalPlayerID="myPlayerID" :initialEvents="gameEvents">
            </GamePane>
        </div>

        <div v-if="!gameExists && gameStateKnown">
            <strong>Error:</strong> Game does not exist

            <button v-if="connected" class="btn btn-sm btn-success" @click="checkExists">Retry</button>
        </div>
    </div>
</template>

<script>
import emitter from 'tiny-emitter'
import ConnectingPane from "@/components/common/ConnectingPane.vue";
import PreGamePane from "@/components/game/PreGamePane.vue";
import GamePane from "@/components/game/GamePane.vue";
import AlertsPane from "@/components/common/AlertsPane.vue";

export default {
    inject: ["$ioSocket"],

    data() {
        return {
            connectErrorMessage: '',

            connected: false,
            inGame: false,
            gameStarted: false,
            gameExists: false,
            gameStateKnown: false,
            gameJoinAttempted: false,

            myPlayerID: this.$route.params.playerId,
            myGameID: this.$route.params.gameId,
            myPlayerMask: this.$route.params.playerId,

            gameEvents: [],
            alerts: [],

            get playerName() {
                return localStorage.getItem('playerName') || '';
            },
            set playerName(value) {
                localStorage.setItem('playerName', value);
            }
        };
    },

    created() {
        this.$events = new emitter();
        this.addInternalHandlers();

        this.$ioSocket.on("connect", this.handleConnect);
        this.$ioSocket.on("connect_error", this.handleConnectError);
        this.$ioSocket.on("disconnect", this.handleDisconnect);
        this.$ioSocket.on("gameJoined", this.handleGameJoined);
        this.$ioSocket.on("handleGameEvent", this.handleGameEvent);
        this.$ioSocket.on("gameExists", this.handleGameExists);
        this.$ioSocket.on("foundNextGame", this.handleFoundNextGame);
        this.$ioSocket.on("gameDoesNotExist", this.handleGameDoesNotExist);
        this.$ioSocket.on("gameRemoved", this.handleGameRemoved);
        this.$ioSocket.on("refreshGame", this.handleRefreshGame);
        this.$ioSocket.on("commandError", this.handleCommandError);
        this.$ioSocket.on("actionError", this.handleCommandError);
        this.$ioSocket.on("error", this.handleCommandError);
        this.$ioSocket.on("rejoinFailed", this.handleRejoinFailed);
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
        this.$ioSocket.off("foundNextGame", this.handleFoundNextGame);
        this.$ioSocket.off("gameDoesNotExist", this.handleGameDoesNotExist);
        this.$ioSocket.off("gameRemoved", this.handleGameRemoved);
        this.$ioSocket.off("refreshGame", this.handleRefreshGame);
        this.$ioSocket.off("commandError", this.handleCommandError);
        this.$ioSocket.off("actionError", this.handleCommandError);
        this.$ioSocket.off("error", this.handleCommandError);
        this.$ioSocket.off("rejoinFailed", this.handleRejoinFailed);
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
            this.gameEvents = [];
            
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
                } else /* if (!event.joinable) */ {
                    this.$ioSocket.emit("spectateGame", this.myGameID);
                }
            }
        },
        
        handleFoundNextGame(event) {
            this.$router.push(`/game/${event.nextGameID}`);
        },

        handleRejoinFailed() {
            this.$ioSocket.emit("spectateGame", this.myGameID);
        },

        handleGameDoesNotExist(event) {
            if (event.game == this.myGameID) {
                this.gameExists = false;
                this.gameStateKnown = true;
            }
        },

        handleGameEvent(event) {
            this.gameEvents.push(event);
            this.$events.emit(event.__type, event);
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
            this.alerts.push({ type: 'danger', message: event.error });
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

            this.myPlayerID = this.$route.params.playerId;
            this.myGameID = this.$route.params.gameId;

            this.connectErrorMessage = '';
        },

        addInternalHandlers() {
            this.$events.on("startGame", () => {
                this.gameStarted  = true;
            });

            this.$events.on("addPlayer", (e) => {
                if (e.self) {
                    this.myPlayerMask = e.id;
                }
            });

            this.$events.on("removePlayer", (e) => {
                if (e.id == this.myPlayerMask) {
                    this.myPlayerID = undefined;
                    this.myPlayerMask = undefined;
                }
            });
        }
    },

    watch: {
        $route (to, from) {
            if (to.params.gameID != from.params.gameID || to.params.playerId != from.params.playerId) {
                this.$ioSocket.emit('exitGame', this.myGameID);
                this.reset();
                this.connected = true;
                this.myPlayerID = to.params.playerId;
                this.myGameID = to.params.gameId;
                this.checkExists();
            }
        }
    },

    components: { ConnectingPane, PreGamePane, GamePane, AlertsPane }
}
</script>

<style>
</style>
