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

        <div v-if="gameLoaded" class="panelContainer">
            <div class="gamePanel">
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
                    <div v-if="Object.keys(waitingFor).length > 0">
                        <strong>Waiting for response from:</strong> {{ Object.values(waitingFor).join(', ') }}
                    </div>
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
                    <button v-if="nextGameID" class="btn btn-success" @click="getNextGame">Join Next Game: {{ nextGameID }}</button>
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
                                    <button type="button" @click="popoutCheatSheet" class="btn-popout" aria-label="Popout"></button>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    <RulesPane></RulesPane>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="logPanel flex-grow-1">
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
            waitingFor: {},

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
            try {
                this.$events.emit(event.__type, event);
            } catch (e) {
                console.log('Error parsing event for game: ', event);
                console.log(e);
                this.$emit('GameError', { 'error': `There was an error parsing event (${event.__type}), game state may be inaccurate.` });
            }
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

        popoutCheatSheet() {
            var cheatSheetModal = Modal.getInstance(document.getElementById('cheatSheetModal'));
            if (cheatSheetModal) {
                cheatSheetModal.hide();
            }

            window.open("/rules","_blank", "popup");
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

            this.$events.on("showDeck", (e) => {
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


            this.$events.on("beginPlayerTurn", () => {
                this.waitingFor = {};
            });

            this.$events.on("counterablePlayerAction", (e) => {
                this.waitingFor = {};
                for (const [pid, player] of Object.entries(this.players)) {
                    if (pid != e.player && player.influence.length > 0) {
                        this.waitingFor[pid] = player.name;
                    }
                }
            });

            this.$events.on("playerActionStillCounterable", (e) => {
                this.waitingFor = {};
                for (const pid of e.players) {
                    this.waitingFor[pid] = this.players[pid].name;
                }
            });

            this.$events.on("challengeablePlayerAction", (e) => {
                this.waitingFor = {};
                for (const [pid, player] of Object.entries(this.players)) {
                    if (pid != e.player && player.influence.length > 0) {
                        this.waitingFor[pid] = player.name;
                    }
                }
            });

            this.$events.on("playerPassed", (e) => {
                delete this.waitingFor[e.player];
            });

            this.$events.on("playerWillCounter", (e) => {
                delete this.waitingFor[e.challenger];
            });

            this.$events.on("playerCountered", (e) => {
                this.waitingFor = {};
                for (const [pid, player] of Object.entries(this.players)) {
                    if (pid != e.challenger && player.influence.length > 0) {
                        this.waitingFor[pid] = player.name;
                    }
                }
            });

            this.$events.on("playerChallenged", () => {
                this.waitingFor = {};
            });

        }
    },
    components: { PlayerPanel, ActionPanel, RulesPane, GameAdminPage, GameLog }
}
</script>

<style scoped lang="scss">
.panelContainer {
    display: flex;
    flex-direction: column;
}

@media (min-width: 1800px) {
    .panelContainer {
        flex-direction: row;
    }

    .gamePanel {
        min-width: 1130px;
        max-width: 1130px;

        border-right: 1px solid lightgray;
        padding-right: 25px;
        margin-right: 25px;
    }
}

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
    word-wrap: break-word;
    word-break: break-word;
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

.btn-popout {
    box-sizing: content-box;
    width: 2em;
    height: 2em;
    // padding: 0.25em 0.25em;
    padding: 0;
    margin: 0 5px;
    color: #000;
    border: 0;
    border-radius: 0.375rem;
    background: transparent url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iNzUycHQiIGhlaWdodD0iNzUycHQiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDc1MiA3NTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiA8Zz4KICA8cGF0aCBkPSJtNTY3Ljg1IDE5NS4yN2MwLTAuNDg0MzgtMC40ODQzNy0wLjk2NDg0LTAuNDg0MzctMS40NDkycy0wLjQ4NDM4LTAuOTY0ODQtMC40ODQzOC0xLjQ0OTJjMC0wLjQ4NDM4LTAuNDg0MzctMC45NjQ4NC0wLjk2NDg0LTEuNDQ5MiAwLTAuNDg0MzgtMC40ODQzOC0wLjQ4NDM4LTAuNDg0MzgtMC45NjQ4NC0wLjk2NDg0LTEuNDQ5Mi0yLjQxOC0yLjg5ODQtMy44NjcyLTMuODY3Mi0wLjQ4NDM4IDAtMC40ODQzOC0wLjQ4NDM4LTAuOTY0ODQtMC40ODQzOC0wLjQ4NDM3LTAuNDg0MzctMC45NjQ4NC0wLjQ4NDM3LTEuNDQ5Mi0wLjk2NDg0LTAuNDg0MzggMC0wLjk2NDg0LTAuNDg0MzgtMS40NDkyLTAuNDg0MzhzLTAuOTY0ODQtMC40ODQzOC0xLjQ0OTItMC40ODQzOGMtMC45NjQ4NCAwLTEuOTMzNi0wLjQ4NDM4LTIuODk4NC0wLjQ4NDM4bC0xMDQuMzggMC4wMDM5MDZjLTUuODAwOCAwLTExLjExMyAzLjM4MjgtMTMuNTMxIDkuMTgzNi0yLjQxOCA1LjMxNjQtMC45NjQ4NCAxMS41OTggMy4zODI4IDE1Ljk0NWw0Mi4wNDMgNDIuMDQzLTE0NC4wMSAxNDQuNDljLTUuODAwOCA1LjgwMDgtNS44MDA4IDE0Ljk4IDAgMjAuMjk3IDIuODk4NCAyLjg5ODQgNi43NjU2IDQuMzQ3NyAxMC4xNDggNC4zNDc3IDMuMzgyOCAwIDcuMjUtMS40NDkyIDEwLjE0OC00LjM0NzdsMTQ0LjAxLTE0NC4wMSA0Mi4wNDMgNDIuMDQzYzIuODk4NCAyLjg5ODQgNi4yODEyIDQuMzQ3NyAxMC4xNDggNC4zNDc3IDEuOTMzNiAwIDMuODY3Mi0wLjQ4NDM4IDUuMzE2NC0wLjk2NDg0IDUuMzE2NC0yLjQxOCA5LjE4MzYtNy43MzA1IDkuMTgzNi0xMy41MzFsLTAuMDAzOTA3LTEwNC44NmMwLjQ4MDQ3LTAuOTY4NzUgMC40ODA0Ny0xLjkzMzYgMC0yLjkwMjN6Ii8+CiAgPHBhdGggZD0ibTUwNC41NCAzNjMuOTJjLTguMjE0OCAwLTE0LjQ5NiA2LjI4MTItMTQuNDk2IDE0LjQ5NnYxNjAuOTJoLTI3Ny4zOHYtMjc3LjM4aDE2MC45MmM4LjIxNDggMCAxNC40OTYtNi4yODEyIDE0LjQ5Ni0xNC40OTYgMC04LjIxNDgtNi4yODEyLTE0LjQ5Ni0xNC40OTYtMTQuNDk2bC0xNzUuNDItMC4wMDM5MDZjLTguMjE0OCAwLTE0LjQ5NiA2LjI4MTItMTQuNDk2IDE0LjQ5NnYzMDYuMzhjMCA4LjIxNDggNi4yODEyIDE0LjQ5NiAxNC40OTYgMTQuNDk2aDMwNi4zOGM4LjIxNDggMCAxNC40OTYtNi4yODEyIDE0LjQ5Ni0xNC40OTZ2LTE3NS40MmMwLTguMjE0OC02LjI4MTItMTQuNDk2LTE0LjUtMTQuNDk2eiIvPgogPC9nPgo8L3N2Zz4K") center/1em auto no-repeat;
    background-size: contain;
    font-size: 0.875rem;
    vertical-align: middle;
    
    html.dark-theme & {
        filter: invert(1) grayscale(100%) brightness(200%);
    }
}
</style>