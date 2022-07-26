<template>
    <div>
        Game: {{ myGameID }}
        <hr>
        
        <ConnectingPane v-if="!connected">
        </ConnectingPane>

        <PreGamePane v-if="connected && !inGame" v-model:playerName="playerName" v-model:playerID="myPlayerID" :gameID="myGameID">
        </PreGamePane>

        <GamePane v-if="connected && inGame" :myPlayerID="myPlayerID" :myGameID="myGameID" :initialEvents="gameEvents">
        </GamePane>
    </div>
</template>

<script>
import ConnectingPane from "@/components/ConnectingPane.vue";
import PreGamePane from "@/components/PreGamePane.vue";
import GamePane from "@/components/GamePane.vue";

import { uniqueNamesGenerator, adjectives as adjectiveList, colors as colourList, animals as animalList } from 'unique-names-generator';

export default {
    inject: ["$ioSocket"],

    data() {
        return {
            playerName: '',

            connected: false,
            inGame: false,

            myPlayerID: this.$route.params.playerId,
            myGameID: this.$route.params.gameId,

            gameEvents: [],
        };
    },
    created() {
        this.$ioSocket.on("connect", () => {
            this.reset();
            this.connected = true;

            if (this.myPlayerID) {
                this.$ioSocket.emit("rejoinGame", this.myGameID, this.myPlayerID);
            }
        });

        this.$ioSocket.on("disconnect", () => {
            this.reset();
        });

        this.$ioSocket.on("gameJoined", (arg) => {
            this.myPlayerID = arg.playerID;
            this.myGameID = arg.gameID;

            this.inGame = true;
            if (this.myPlayerID != undefined) {
                this.$router.push(`/game/${this.myGameID}/${this.myPlayerID}`);
            }
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

            this.playerName = uniqueNamesGenerator({ dictionaries: [[...adjectiveList, ...colourList], animalList], length: 2, separator: '', style: 'capital' });
            this.myPlayerID = this.$route.params.playerId;
            this.myGameID = this.$route.params.gameId;
        },
    },

    components: { ConnectingPane, PreGamePane, GamePane }
}
</script>

<style>
</style>
