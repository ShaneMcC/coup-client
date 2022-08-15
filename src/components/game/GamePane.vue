<template>
    <div>
        <div v-if="false">
            <!--
            <button class="btn btn-sm btn-danger" @click="disconnect">Disconnect</button>
        -->
            <!--
            <button class="btn btn-sm btn-danger" @click="leave">Leave</button>
        -->
            <!--
            <hr>
        -->
        </div>

        <div v-if="gameLoaded">
            <div v-if="isAdmin" class="gameAdmin">
                <div v-if="false">
                    <!-- TODO: I'd prefer this was a menu item not a button, but this works for now. -->
                </div>
                <a class="btn btn-primary" data-bs-toggle="offcanvas" href="#adminCanvas" role="button" aria-controls="adminCanvas">
                    Game Admin
                </a>

                <div class="offcanvas offcanvas-end" tabindex="-1" data-bs-scroll="true" data-bs-backdrop="false" id="adminCanvas" aria-labelledby="adminCanvasLabel">
                    <div class="offcanvas-header">
                        <h5 class="offcanvas-title" id="adminCanvasLabel">Game Admin for {{ myGameID }}</h5>
                        <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    <div class="offcanvas-body">
                        <GameAdminPage ref="adminPanel" :gameID="myGameID"></GameAdminPage>
                    </div>
                </div>
            </div>

            <div v-if="players[myPlayerID]" class="viewerDetails">
                You are playing as <strong>{{ players[myPlayerID].name }}</strong>
            </div>
            <div v-else class="viewerDetails">
                You are spectating
            </div>

            <div class="players">
                Players:

                <div class="gameTable">
                    <div v-if="gameStarted" class="deckView">
                        <div class="playerPanels">
                            <PlayerPanel :game="myGameID" :self="players[myPlayerID]" :player="deckPlayer"></PlayerPanel>
                        </div>
                    </div>
                    <div class="playerView">
                        <div class="playerPanels">
                            <PlayerPanel v-for="(player, playerID) in players" :key="playerID" :game="myGameID" :player="player" :self="players[myPlayerID]"></PlayerPanel>

                            <div v-if="Object.keys(players).length == 0">
                                <strong>There are currently no players in this game.</Strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="actions" v-if="!gameOver && players[myPlayerID]">
                <strong v-html="actionsMessage"></strong>
                <br>
                Available Actions:

                <div class="actionPanels">
                    <ActionPanel v-for="(action, actionID) in availableActions" :key="actionID" :myGameID="myGameID" :myPlayerID="myPlayerID" :players="players" :action="action" :actionID="actionID" @newActions="newActions" @deleteAction="deleteAction"></ActionPanel>

                    <div v-if="Object.keys(availableActions).length == 0" class="actionPanels">
                        <strong>No actions available.</strong>
                    </div>
                </div>
            </div>

            <div class="actions" v-if="gameOver && players[myPlayerID]">
                <strong v-html="actionsMessage"></strong>
                <br>
                <button v-if="!nextGameID" class="btn btn-success" @click="getNextGame">Create Next Game</button>
                <button v-if="nextGameID" class="btn btn-success" @click="getNextGame">Join Next Game</button>
            </div>

            <div class="actions">
                <button type="button" class="btn btn-sm btn-dark" data-bs-toggle="modal" data-bs-target="#cheatSheetModal">
                    Show Cheat Sheet
                </button>

                <div class="modal fade" id="cheatSheetModal" tabindex="-1" aria-labelledby="cheatSheetModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="cheatSheetModalLabel">Cheat Sheet</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <RulesPane></RulesPane>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="actions" v-if="players[myPlayerID]">
                <form class="form" @submit.prevent="sendChatMessage">
                    <div class="d-flex flex-row align-items-center flex-wrap">
                        <label for="chatMessage">Chat:</label>
                        <input id="chatMessage" class="form-control w-auto mx-2" v-model="chatMessage">

                        <button class="btn btn-sm btn-primary" type="submit">Send</button>
                    </div>
                </form>
            </div>

            <GameLog ref="gameLog" @ready="gameLogReady" @setActionsMessage="(e) => actionsMessage = e"></GameLog>

            <div class="gameEvents" v-if="isAdmin || !$appConfig.isProduction">
                Game Events
                <button class="btn btn-sm btn-primary" v-if="!showEvents" @click="showEvents = true">Show</button>
                <button class="btn btn-sm btn-primary" v-if="showEvents" @click="showEvents = false">Hide</button>

                <ul v-if="showEvents">
                    <li v-for="(event, eventID) in gameEvents/*.filter(e => e.__type != 'showActions')*/" :key="eventID" class="event">
                        <span v-if="isAdmin && event.__type != 'showActions'">[<a href="#" @click.prevent="rollbackUntil(event.date)">&lt;&lt;R</a>] </span>
                        <span v-if="isAdmin && event.__type == 'showActions'">[&nbsp;&nbsp;&nbsp;] </span>
                        {{ displayEvent(event) }}
                        <span v-if="event.__type == 'beginPlayerTurn'"><br><br></span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import emitter from 'tiny-emitter'
import PlayerPanel from './PlayerPanel.vue';
import ActionPanel from './ActionPanel.vue';
import RulesPane from '../common/RulesPane.vue';
import GameAdminPage from '@/views/GameAdminPage.vue';

import { Modal, Offcanvas } from 'bootstrap'
import GameLog from './GameLog.vue'

export default {
    inject: ["$ioSocket", "$appConfig"],

    props: ["myGameID", "originalPlayerID", "initialEvents"],

    data() {
        return {
            gameStarted: false,
            gameOver: false,
            gameLoaded: false,
            nextGameID: '',
            gameEvents: [],
            actionsMessage: '',
            showEvents: false,
            availableActions: {},
            players: {},
            myPlayerID: this.originalPlayerID,
            chatMessage: '',
            activePlayer: '',
            deck: [],

            get isAdmin() {
                return localStorage.getItem('isAdmin') || false;
            },
        };
    },

    computed: {
        deckPlayer() {
            return {
                "id": "Game Deck",
                "name": "Game Deck",
                "coins": undefined,
                "influence": [...this.deck],
                "discardedInfluence": [],
                "ready": true,
                "actions": {},
            };
        }
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

    beforeUnmount() {
        var cheatSheetModal = Modal.getInstance(document.getElementById('cheatSheetModal'));
        if (cheatSheetModal) {
            cheatSheetModal.hide();
        }

        var adminCanvas = Offcanvas.getInstance(document.getElementById('adminCanvas'));
        if (adminCanvas) {
            adminCanvas.hide();
        }
    },

    unmounted() {
        this.$ioSocket.off("handleGameEvent", this.handleEvent);
        this.$ioSocket.off("gameLoaded", this.handleGameLoaded);
        delete this.$events;
        this.$events = undefined;
    },

    methods: {
        gameLogReady() {
            if (this.$refs.gameLog) {
                for (const event of this.initialEvents) {
                    this.$refs.gameLog.handleEvent(event);
                }
            }
        },

        handleGameLoaded() {
            this.gameLoaded = true;
        },

        handleEvent(event) {
            this.gameEvents.unshift(event);
            this.$events.emit(event.__type, event);
            if (this.$refs.gameLog) {
                this.$refs.gameLog.handleEvent(event);
            }
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
            delete this.availableActions[actionID];
        },

        getNextGame() {
            this.$ioSocket.emit("getNextGame", this.myGameID);
        },

        sendChatMessage() {
            this.$ioSocket.emit("action", this.myGameID, 'CHAT', this.chatMessage);
            this.chatMessage = '';
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

        rollbackUntil(date) {
            this.$refs.adminPanel.rollbackUntil(date);
        },

        addInternalHandlers() {
            this.$events.on("gameCreated", () => {
                this.gameLoaded = false;
                this.gameStarted = false;
            });

            this.$events.on("nextGameAvailable", (e) => {
                if (e.nextGameID) {
                    this.nextGameID = e.nextGameID;
                }
            });

            this.$events.on("addPlayer", (e) => {
                this.players[e.id] = {
                    "id": e.id,
                    "name": e.name,
                    "coins": 0,
                    "influence": [],
                    "discardedInfluence": [],
                    "ready": false,
                    "actions": { 'KICK': { name: 'Kick', confirm: 'Are you sure you want to kick this player?', classes: ["btn-danger"] } }
                };

                if (e.self) {
                    this.myPlayerID = e.id;
                }
            });

            this.$events.on("removePlayer", (e) => {
                delete this.players[e.id];

                if (e.id == this.myPlayerID) {
                    this.$router.push(`/game/${this.myGameID}`);
                }
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

                this.gameOver = true;
            });

            this.$events.on("gameEnded", () => {
                this.players[this.activePlayer].active = false;
                this.activePlayer = undefined;
            });

            this.$events.on("startGame", () => {
                this.gameStarted = true;

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

            this.$events.on("playerSpentCoins", (e) => {
                this.players[e.player].coins -= e.coins;
            });

            this.$events.on("setDeck", (e) => {
                this.deck = [...e.deck];
            });

            this.$events.on("allocateInfluence", (e) => {
                this.players[e.player].influence.push(e.influence);
                // TODO: This should probably splice out the correct influence.
                this.deck.splice(0, 1);
            });

            this.$events.on("allocateNextInfluence", (e) => {
                e.influence = this.deck.shift();
                this.players[e.player].influence.push(e.influence);
            });

            const discardInfluenceHandler = (e) => {
                var influenceLocation = this.players[e.player].influence.indexOf(e.influence);

                if (influenceLocation == -1) {
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

            const returnInfluenceHandler = (e) => {
                discardInfluenceHandler(e);
                this.deck.push(e.influence);
            }
            this.$events.on("returnInfluenceToDeck", returnInfluenceHandler);
            this.$events.on("returnKnownInfluenceToDeck", returnInfluenceHandler);

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

            this.$events.on("showPlayerInfluence", (e) => {
                this.players[e.player].influence = e.influence;
            });
        }
    },
    components: { PlayerPanel, ActionPanel, RulesPane, GameAdminPage, GameLog }
}
</script>

<style scoped lang="scss">
.gameAdmin {
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid lightgray;
}

.players,
.actions,
.gameLog,
.gameEvents {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid lightgray;
}

li.event {
    font-family: monospace;
}

.players {
    .gameTable {
        display: flex;
        flex-wrap: nowrap;

        @media (max-width: 450px) {
            flex-direction: column;
        }

        .deckView {
            flex-basis: 220px;
            justify-content: center;

            @media (max-width: 450px) {
                flex-basis: auto;
                align-items: center;
            }
        }

        .playerView {
            flex-grow: 1;
            flex-basis: auto;

            @media (max-width: 450px) {
                align-items: center;
            }
        }

        .playerPanels {
            display: flex;
            flex-wrap: wrap;

            flex-direction: row;
            align-items: flex-start;

            @media (max-width: 450px) {
                flex-direction: column;
                align-items: center;
            }
        }
    }
}

.offcanvas {
    background-color: #ededed;

    html.dark-theme & {
        background-color: #1d1d1d;
    }

    width: 800px;
}
</style>