<template>
    <div>
        <ConnectingPane v-if="!connected">
        </ConnectingPane>

        <PreGamePane v-if="connected && !inGame" v-model:playerName="playerName" v-model:rejoinPlayerID="myPlayerID" v-model:rejoinGameID="myGameID">
        </PreGamePane>

        <GamePane v-if="connected && inGame" :myPlayerID="myPlayerID" :myGameID="myGameID" :initialEvents="gameEvents">
        </GamePane>
    </div>
</template>

<script>
import ConnectingPane from "./components/ConnectingPane.vue";
import PreGamePane from "./components/PreGamePane.vue";
import GamePane from "./components/GamePane.vue";

export default {
    inject: ["$ioSocket"],

    data() {
        return {
            playerName: "Player1",

            connected: false,
            inGame: false,

            myPlayerID: "Alice",
            myGameID: "TestGame",

            gameEvents: [],
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

        this.$ioSocket.on("gameJoined", (arg) => {
            this.myPlayerID = arg.playerID;
            this.myGameID = arg.gameID;

            this.inGame = true;
        });

        this.$ioSocket.on("handleGameEvent", (event) => {
            this.gameEvents.push(event);
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
            this.inGame = false;
            this.gameStarted = false;
            this.gameEvents = [];
        },
    },

    components: { ConnectingPane, PreGamePane, GamePane }
}
</script>

<style>
</style>
