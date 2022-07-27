<template>
    <div>
        <button @click="disconnect">Disconnect</button>
        <!-- <button @click="leave">Leave</button> -->
        <hr>
        <div v-if="gameLoaded">
            <div v-if="players[myPlayerID]">
                We are <strong>{{ myPlayerID }}</strong>
            </div>
            <div v-else>
                We are spectating {{ myGameID }}
            </div>

            <div class="players">
                <hr>
                Players:

                <div class="playerPanels">
                    <PlayerPanel v-for="(player, playerID) in players" :key="playerID" :game="myGameID" :player="player" :self="players[myPlayerID]"></PlayerPanel>
                </div>
            </div>

            <div class="actions" v-if="players[myPlayerID]">
                <hr>
                Available Actions:

                <div class="actionPanels">
                    <ActionPanel v-for="(action, actionID) in availableActions" :key="actionID" :myGameID="myGameID" :myPlayerID="myPlayerID" :players="players" :action="action" :actionID="actionID" @newActions="newActions" @deleteAction="deleteAction"></ActionPanel>
                </div>
            </div>

            <div class="gameEvents">
                <hr>
                Game Events:

                <ul>
                    <li v-for="(event, eventID) in gameEvents.filter(e => e.__type != 'showActions')" :key="eventID" class="event">{{ displayEvent(event) }}</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import emitter from 'tiny-emitter'
import PlayerPanel from './PlayerPanel.vue';
import ActionPanel from './ActionPanel.vue';

export default {
    inject: ["$ioSocket", "$appConfig"],

    props: ["myGameID", "myPlayerID", "initialEvents"],

    data() {
        return {
            gameLoaded: false,
            gameEvents: [],
            availableActions: {},
            players: {},

            activePlayer: '',
        };
    },

    created() {
        this.$events = new emitter();
        this.addInternalHandlers();

        // This is mostly for dev, our parent keeps track of events for us to reload with.
        if (this.initialEvents.length > 0) {
            for (const event of this.initialEvents) {
                this.handleEvent(event);
            }
            this.handleGameLoaded();
        }

        this.$ioSocket.on("handleGameEvent", this.handleEvent);
        this.$ioSocket.on("gameLoaded", this.handleGameLoaded);
    },

    unmounted() {
        this.$ioSocket.off("handleGameEvent", this.handleEvent);
        this.$ioSocket.off("gameLoaded", this.handleGameLoaded);
    },

    methods: {
        handleGameLoaded() {
            this.gameLoaded = true;
        },

        handleEvent(event) {
            this.gameEvents.unshift(event);
            this.$events.emit(event.__type, event);
        },

        disconnect() {
            this.$ioSocket.disconnect();
        },

        leave() {
            this.$ioSocket.disconnect();
            this.$router.push(`/game/${this.myGameID}`);
        },

        newActions(actions) {
            this.availableActions = actions;
        },

        deleteAction(actionID) {
            console.log(actionID);
            delete this.availableActions[actionID];
        },

        displayEvent(event) {
            event = JSON.parse(JSON.stringify(event));

            var date = event.date;
            var type = event.__type;

            delete event.date;
            delete event.__type;
            delete event.game;

            return `[${date}] ${type} - ${JSON.stringify(event)}`;
        },

        addInternalHandlers() {
            this.$events.on("addPlayer", (e) => {
                this.players[e.id] = {
                    "id": e.id,
                    "name": e.name,
                    "coins": 0,
                    "influence": [],
                    "discardedInfluence": [],
                    "ready": false,
                    "actions": { 'KICK': { name: 'Kick' } }
                };
            });

            this.$events.on("removePlayer", (e) => {
                delete this.players[e.id];
            });

            this.$events.on("playerReady", (e) => {
                this.players[e.player].ready = true;
            });

            this.$events.on("playerNotReady", (e) => {
                this.players[e.player].ready = false;
            });

            this.$events.on("setPlayerName", (e) => {
                this.players[e.player]["name"] = e.name;
                if (e.player == this.myPlayerID) {
                    this.playerName = e.name;
                }
            });

            this.$events.on("gameOver", (e) => {
                this.activePlayer = e.winner;
                this.players[this.activePlayer].active = true;
            });

            this.$events.on("startGame", () => {
                for (const p in this.players) {
                    delete this.players[p]['actions']['KICK'];
                }
            });

            this.$events.on("playerGainedCoins", (e) => {
                this.players[e.player].coins += e.coins;
            });

            this.$events.on("playerLostCoins", (e) => {
                this.players[e.player].coins -= e.coins;
            });

            this.$events.on("allocateInfluence", (e) => {
                this.players[e.player].influence.push(e.influence);
            });

            const discardInfluenceHandler = (e) => {
                var influenceLocation = -1;

                if (e.player == this.myPlayerID) {
                    influenceLocation = this.players[e.player].influence.indexOf(e.influence);

                } else {
                    influenceLocation = this.players[e.player].influence.indexOf("UNKNOWN");
                }

                if (influenceLocation > -1) {
                    this.players[e.player].influence.splice(influenceLocation, 1);
                }
            }

            this.$events.on("discardInfluence", (e) => {
                discardInfluenceHandler(e);
                this.players[e.player].discardedInfluence.push(e.influence);
            });

            this.$events.on("returnInfluenceToDeck", discardInfluenceHandler);

            this.$events.on("beginPlayerTurn", (e) => {
                if (this.activePlayer) {
                    this.players[this.activePlayer].active = false;
                }

                this.activePlayer = e.player;
                this.players[this.activePlayer].active = true;
            });

            this.$events.on("showActions", (e) => {
                this.availableActions = e.actions;
            });
        }
    },
    components: { PlayerPanel, ActionPanel }
}
</script>

<style>
.playerPanels {
    display: flex;
    flex-wrap: wrap;
}

li.event {
    font-family: monospace;
}
</style>
