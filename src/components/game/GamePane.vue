<template>
    <div>
        <!--
            <button class="btn btn-sm btn-danger" @click="disconnect">Disconnect</button>
        -->
        <!--
            <button class="btn btn-sm btn-danger" @click="leave">Leave</button>
        -->
        <!--
            <hr>
        -->
        <div v-if="gameLoaded">
            <div v-if="players[myPlayerID]">
                We are playing as <strong>{{ players[myPlayerID].name }}</strong>
            </div>
            <div v-else>
                We are spectating.
            </div>

            <div class="players">
                Players:

                <div class="playerPanels">
                    <PlayerPanel v-for="(player, playerID) in players" :key="playerID" :game="myGameID" :player="player" :self="players[myPlayerID]"></PlayerPanel>
                </div>
            </div>

            <div class="actions" v-if="players[myPlayerID]">
                Available Actions:

                <div class="actionPanels">
                    <ActionPanel v-for="(action, actionID) in availableActions" :key="actionID" :myGameID="myGameID" :myPlayerID="myPlayerID" :players="players" :action="action" :actionID="actionID" @newActions="newActions" @deleteAction="deleteAction"></ActionPanel>

                    <div v-if="Object.keys(availableActions).length == 0" class="actionPanels">
                        <strong>No actions available.</strong>
                    </div>
                </div>


            </div>

            <div class="gameLog">
                Game Log:
                <button class="btn btn-sm btn-primary" v-if="!showGameLog" @click="showGameLog = true">Show</button>
                <button class="btn btn-sm btn-primary" v-if="showGameLog" @click="showGameLog = false">Hide</button>

                <ul v-if="showGameLog">
                    <li v-for="(log, id) in gameLog" :key="id" class="event" v-html="log"></li>
                </ul>
            </div>

            <div class="gameEvents">
                Game Events
                <button class="btn btn-sm btn-primary" v-if="!showEvents" @click="showEvents = true">Show</button>
                <button class="btn btn-sm btn-primary" v-if="showEvents" @click="showEvents = false">Hide</button>

                <ul v-if="showEvents">
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

    props: ["myGameID", "initialEvents"],

    data() {
        return {
            gameLoaded: false,
            gameEvents: [],
            showEvents: false,
            gameLog: [],
            showGameLog: true,
            availableActions: {},
            players: {},
            myPlayerID: '',

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
            this.$events.on("gameCreated", () => {
                this.gameLog = [];
            });

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

                if (e.self) {
                    this.myPlayerID = e.id;
                    this.gameLog.unshift(`[${e.date}] You joined the game as ${this.players[e.id].name}`);
                } else {
                    this.gameLog.unshift(`[${e.date}] ${this.players[e.id].name} joined the game`);
                }
            });

            this.$events.on("removePlayer", (e) => {
                this.gameLog.unshift(`[${e.date}] ${this.players[e.id].name} left the game`);
                delete this.players[e.id];
            });

            this.$events.on("playerReady", (e) => {
                this.gameLog.unshift(`[${e.date}] ${this.players[e.player].name} is ready`);
                this.players[e.player].ready = true;
            });

            this.$events.on("playerNotReady", (e) => {
                this.gameLog.unshift(`[${e.date}] ${this.players[e.player].name} is not ready`);
                this.players[e.player].ready = false;
            });

            this.$events.on("setPlayerName", (e) => {
                this.gameLog.unshift(`[${e.date}] ${this.players[e.player].name} is now ${e.name}`);

                this.players[e.player]["name"] = e.name;
                if (e.player == this.myPlayerID) {
                    this.playerName = e.name;
                }
            });

            this.$events.on("gameOver", (e) => {
                this.gameLog.unshift(`[${e.date}] Game over. ${this.players[e.winner].name} was the winner.`);

                this.activePlayer = e.winner;
                this.players[this.activePlayer].active = true;
            });

            this.$events.on("startGame", (e) => {
                this.gameLog.unshift(`[${e.date}] Game started.`);

                for (const p in this.players) {
                    delete this.players[p]['actions']['KICK'];
                }
            });

            this.$events.on("playerGainedCoins", (e) => {
                this.gameLog.unshift(`[${e.date}] ${this.players[e.player].name} gained ${e.coins} coins`);

                this.players[e.player].coins += e.coins;
            });

            this.$events.on("playerLostCoins", (e) => {
                this.gameLog.unshift(`[${e.date}] ${this.players[e.player].name} lost ${e.coins} coins`);

                this.players[e.player].coins -= e.coins;
            });

            this.$events.on("allocateInfluence", (e) => {
                this.gameLog.unshift(`[${e.date}] ${this.players[e.player].name} was allocated influence: ${e.influence}`);

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
                this.gameLog.unshift(`[${e.date}] ${this.players[e.player].name} discarded influence: ${e.influence}`);
                this.players[e.player].discardedInfluence.push(e.influence);
            });

            this.$events.on("returnInfluenceToDeck", discardInfluenceHandler);

            this.$events.on("beginPlayerTurn", (e) => {
                this.gameLog.unshift(`[${e.date}] ${this.players[e.player].name} started their turn.`);

                if (this.activePlayer) {
                    this.players[this.activePlayer].active = false;
                }

                this.activePlayer = e.player;
                this.players[this.activePlayer].active = true;
            });

            this.$events.on("showActions", (e) => {
                this.availableActions = e.actions;
            });

            this.$events.on("playerPerformedAction", (e) => {
                if (e.target) {
                    this.gameLog.unshift(`[${e.date}] ${this.players[e.player].name} performed action ${e.action} on ${this.players[e.target].name}`);
                } else {
                    this.gameLog.unshift(`[${e.date}] ${this.players[e.player].name} performed action ${e.action}`);
                }
            });

            this.$events.on("counterablePlayerAction", (e) => {
                if (e.target) {
                    this.gameLog.unshift(`[${e.date}] ${this.players[e.player].name} is attempting action ${e.action} on ${this.players[e.target].name}`);
                } else {
                    this.gameLog.unshift(`[${e.date}] ${this.players[e.player].name} is attempting action ${e.action}`);
                }
            });

            this.$events.on("playerPassed", (e) => {
                this.gameLog.unshift(`[${e.date}] ${this.players[e.player].name} allowed the action.`);
            });

            this.$events.on("playerCountered", (e) => {
                this.gameLog.unshift(`[${e.date}] ${this.players[e.challenger].name} countered ${this.players[e.challenger].name}'s ${e.action} with: ${e.counter}.`);
            });

            this.$events.on("playerPassedChallenge", (e) => {
                this.gameLog.unshift(`[${e.date}] ${this.players[e.player].name} passed the challenge by revealing ${e.influence}.`);
            });

            this.$events.on("playerFailedChallenge", (e) => {
                this.gameLog.unshift(`[${e.date}] ${this.players[e.player].name} failed the challenge.`);
            });
        }
    },
    components: { PlayerPanel, ActionPanel }
}
</script>

<style scoped lang="scss">
.players,
.actions,
.gameLog,
.gameEvents {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid lightgray;
}

.playerPanels {
    display: flex;
    flex-wrap: wrap;
}

li.event {
    font-family: monospace;
}
</style>
