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
            <div v-if="players[myPlayerID]">
                We are playing as <strong>{{ players[myPlayerID].name }}</strong>
                <!-- 
                    TODO: A thing for people to copy the URL without their UUID.
                -->
            </div>
            <div v-else>
                We are spectating.
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

            <div class="gameLog">
                Game Log:
                <button class="btn btn-sm btn-primary" v-if="!showGameLog" @click="showGameLog = true">Show</button>
                <button class="btn btn-sm btn-primary" v-if="showGameLog" @click="showGameLog = false">Hide</button>

                <ul v-if="showGameLog">
                    <li v-for="(log, id) in gameLog" :key="id" class="event" :class="log.event.__type">
                        [<span class="date" v-html="new Date(log.date).toLocaleTimeString()"></span>]
                        <span class="date" v-html="log.message"></span>
                        <br v-if="log.separator">
                        <br v-if="log.separator">
                    </li>
                </ul>
            </div>

            <div class="gameEvents" v-if="!$appConfig.isProduction">
                Game Events
                <button class="btn btn-sm btn-primary" v-if="!showEvents" @click="showEvents = true">Show</button>
                <button class="btn btn-sm btn-primary" v-if="showEvents" @click="showEvents = false">Hide</button>

                <ul v-if="showEvents">
                    <li v-for="(event, eventID) in gameEvents/*.filter(e => e.__type != 'showActions')*/" :key="eventID" class="event">{{ displayEvent(event) }}</li>
                </ul>
            </div>
        </div>

        <!-- Modal -->
        <div class="modal fade" id="cheatSheetModal" tabindex="-1" aria-labelledby="cheatSheetModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="cheatSheetModalLabel">Cheat Sheet</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <table class="table text-center">
                            <tr>
                                <th>Influences</th>
                                <th>Action</th>
                                <th>Effect</th>
                                <th>Counteraction</th>
                            </tr>

                            <tr>
                                <td>&mdash;</td>
                                <td>Income</td>
                                <td>Gain 1 coin</td>
                                <td>X</td>
                            </tr>

                            <tr>
                                <td>&mdash;</td>
                                <td>Foreign Aid</td>
                                <td>Gain 2 coins</td>
                                <td>&mdash;</td>
                            </tr>

                            <tr>
                                <td>&mdash;</td>
                                <td>Coup</td>
                                <td>Pay 7 coins<br><small>Make any player lose 1 influence</small></td>
                                <td>&mdash;</td>
                            </tr>

                            <tr class="DUKE">
                                <td>DUKE</td>
                                <td>TAX</td>
                                <td>Gain 3 coins</td>
                                <td>Block Foreign Aid</td>
                            </tr>

                            <tr class="ASSASSIN">
                                <td>ASSASSIN</td>
                                <td>ASSASSINATE</td>
                                <td>Pay 3 coins<br><small>Make any player lose 1 influence</small></td>
                                <td>&mdash;</td>
                            </tr>

                            <tr class="AMBASSADOR">
                                <td>AMBASSADOR</td>
                                <td>EXCHANGE</td>
                                <td>Draw 2 influence, discard any 2 influence back into the deck</td>
                                <td>Block STEAL</td>
                            </tr>

                            <tr class="CAPTAIN">
                                <td>CAPTAIN</td>
                                <td>STEAL</td>
                                <td>Take 2 coins from another player</td>
                                <td>Block STEAL</td>
                            </tr>

                            <tr class="CONTESSA">
                                <td>CONTESSA</td>
                                <td>&mdash;</td>
                                <td>&mdash;</td>
                                <td>Block ASSASSINATE</td>
                            </tr>

                        </table>
                    </div>
                </div>
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
            gameStarted: false,
            gameOver: false,
            gameLoaded: false,
            nextGameID: '',
            gameEvents: [],
            showEvents: false,
            gameLog: [],
            turnLog: [],
            actionsMessage: '',
            showGameLog: true,
            availableActions: {},
            players: {},
            myPlayerID: '',
            chatMessage: '',
            activePlayer: '',
            deck: [],
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

    unmounted() {
        this.$ioSocket.off("handleGameEvent", this.handleEvent);
        this.$ioSocket.off("gameLoaded", this.handleGameLoaded);
        delete this.$events;
        this.$events = undefined;
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

        htmlEntities(str) {
            return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        },

        addToGameLog(logItem) {
            this.gameLog.unshift(logItem);
            this.turnLog.push(logItem);

            if (logItem.actionMessage) {
                this.actionsMessage = logItem.message;
            }
        },

        addInternalHandlers() {
            this.$events.on("gameCreated", () => {
                this.gameLoaded = false;
                this.gameStarted = false;
            });

            this.$events.on("nextGameAvailable", (e) => {
                if (e.nextGameID) {
                    this.nextGameID = e.nextGameID;
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `Next game available: <span class="nextGame"><a href="/game/${this.htmlEntities(e.nextGameID)}">${this.htmlEntities(e.nextGameID)}</span>`
                    });
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
                    "actions": { 'KICK': { name: 'Kick' } }
                };

                if (e.self) {
                    this.myPlayerID = e.id;
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `You joined the game as <span class="player">${this.htmlEntities(this.players[e.id].name)}</span>`
                    });
                } else {
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `<span class="player">${this.htmlEntities(this.players[e.id].name)}</span> joined the game`
                    });
                }
            });

            this.$events.on("removePlayer", (e) => {
                if (e.kickedBy) {
                    if (e.reason) {
                        this.addToGameLog({
                            date: e.date,
                            event: e,
                            message: `<span class="player">${this.htmlEntities(this.players[e.id].name)}</span> was kicked from the game by <span class="kickedBy">${this.htmlEntities(this.players[e.kickedBy].name)}</span> (<span class="reason">${this.htmlEntities(e.reason)}</span>)`
                        });
                    } else {
                        this.addToGameLog({
                            date: e.date,
                            event: e,
                            message: `<span class="player">${this.htmlEntities(this.players[e.id].name)}</span> was kicked from the game by <span class="kickedBy">${this.htmlEntities(this.players[e.kickedBy].name)}</span>`
                        });
                    }
                } else {
                    if (e.reason) {
                        this.addToGameLog({
                            date: e.date,
                            event: e,
                            message: `<span class="player">${this.htmlEntities(this.players[e.id].name)}</span> left the game (<span class="reason">${this.htmlEntities(e.reason)}</span>)`
                        });
                    } else {
                        this.addToGameLog({
                            date: e.date,
                            event: e,
                            message: `<span class="player">${this.htmlEntities(this.players[e.id].name)}</span> left the game`
                        });
                    }
                }
                delete this.players[e.id];

                if (e.id == this.myPlayerID) {
                    this.$router.push(`/game/${this.myGameID}`);
                }
            });

            this.$events.on("playerReady", (e) => {
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> is ready`
                });
                this.players[e.player].ready = true;
            });

            this.$events.on("playerNotReady", (e) => {
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> is not ready`
                });
                this.players[e.player].ready = false;
            });

            this.$events.on("setPlayerName", (e) => {
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> is now <span class="player">${this.htmlEntities(e.name)}</span>`
                });

                this.players[e.player]["name"] = e.name;
                if (e.player == this.myPlayerID) {
                    this.playerName = e.name;
                }
            });

            this.$events.on("gameOver", (e) => {
                this.turnLog = [];

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `Game over. <span class="player">${this.htmlEntities(this.players[e.winner].name)}</span> was the winner.`,
                    actionMessage: true
                });

                this.activePlayer = e.winner;
                this.players[this.activePlayer].active = true;

                this.gameOver = true;
            });

            this.$events.on("gameEnded", (e) => {
                this.turnLog = [];

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `Game ended. ${e.reason}`,
                    actionMessage: true
                });

                this.players[this.activePlayer].active = false;
                this.activePlayer = undefined;
            });

            this.$events.on("startGame", (e) => {
                this.gameStarted = true;

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `Game started.`,
                    actionMessage: true,
                    separator: true
                });

                for (const p in this.players) {
                    delete this.players[p]['actions']['KICK'];
                }
            });

            this.$events.on("playerGainedCoins", (e) => {
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> gained <span class="coins">${e.coins}</span> coins`
                });

                this.players[e.player].coins += e.coins;
            });

            this.$events.on("playerLostCoins", (e) => {
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> lost <span class="coins">${e.coins}</span> coins`
                });

                this.players[e.player].coins -= e.coins;
            });

            this.$events.on("playerSpentCoins", (e) => {
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> spent <span class="coins">${e.coins}</span> coins`
                });

                this.players[e.player].coins -= e.coins;
            });

            this.$events.on("setDeck", (e) => {
                this.deck = [...e.deck];
            });

            this.$events.on("allocateInfluence", (e) => {
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> was allocated influence: <span class="influence">${e.influence}</span>`
                });

                this.players[e.player].influence.push(e.influence);
                this.deck.splice(0, 1);
            });

            this.$events.on("allocateNextInfluence", (e) => {
                e.influence = this.deck.shift();

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> was allocated the next influence in the deck: <span class="influence">${e.influence}</span>`
                });

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
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> discarded influence: <span class="influence">${e.influence}</span>`
                });
                this.players[e.player].discardedInfluence.push(e.influence);
            });

            const returnInfluenceHandler = (e) => {
                discardInfluenceHandler(e);
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> returned influence to the deck: <span class="influence">${e.influence}</span>`,
                    actionMessage: true
                });

                this.deck.push(e.influence);
            }
            this.$events.on("returnInfluenceToDeck", returnInfluenceHandler);
            this.$events.on("returnKnownInfluenceToDeck", returnInfluenceHandler);

            this.$events.on("beginPlayerTurn", (e) => {
                this.turnLog = [];

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> started their turn.`,
                    actionMessage: true,
                    separator: true,
                });

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
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> performed action <span class="action ${e.action}">${e.action}</span> on <span class="target">${this.htmlEntities(this.players[e.target].name)}</span>`,
                        actionMessage: true
                    });
                } else {
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> performed action <span class="action ${e.action}">${e.action}</span>`,
                        actionMessage: true
                    });
                }
            });

            this.$events.on("counterablePlayerAction", (e) => {
                if (e.target) {
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> is attempting action <span class="action ${e.action}">${e.action}</span> on <span class="target">${this.htmlEntities(this.players[e.target].name)}</span>`,
                        actionMessage: true
                    });
                } else {
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> is attempting action <span class="action ${e.action}">${e.action}</span>`,
                        actionMessage: true
                    });
                }
            });

            this.$events.on("playerActionStillCounterable", (e) => {
                if (e.target) {
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> is continuing with action <span class="action ${e.action}">${e.action}</span> on <span class="target">${this.htmlEntities(this.players[e.target].name)}</span>`,
                        actionMessage: true
                    });
                } else {
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> is continuing with action <span class="action ${e.action}">${e.action}</span>`,
                        actionMessage: true
                    });
                }
            });

            this.$events.on("challengeablePlayerAction", (e) => {
                if (e.target) {
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> is attempting action <span class="action ${e.action}">${e.action}</span> on <span class="target">${this.htmlEntities(this.players[e.target].name)}</span>`,
                        actionMessage: true
                    });
                } else {
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> is attempting action <span class="action ${e.action}">${e.action}</span>`,
                        actionMessage: true
                    });
                }
            });

            this.$events.on("playerPassed", (e) => {
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> allowed the action.`
                });
            });

            this.$events.on("playerCountered", (e) => {
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="challenger">${this.htmlEntities(this.players[e.challenger].name)}</span> countered <span class="player">${this.htmlEntities(this.players[e.player].name)}</span>'s <span class="action ${e.action}">${e.action}</span> with: <span class="counter ${e.counter}">${e.counter}</span>.`,
                    actionMessage: true
                });
            });

            this.$events.on("playerChallenged", (e) => {
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="challenger">${this.htmlEntities(this.players[e.challenger].name)}</span> challenged <span class="player">${this.htmlEntities(this.players[e.player].name)}</span>'s <span class="action ${e.action}">${e.action}</span>.`,
                    actionMessage: true
                });
            });

            this.$events.on("playerPassedChallenge", (e) => {
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> passed the challenge by revealing <span class="influence">${e.influence}</span>.`
                });
            });

            this.$events.on("playerFailedChallenge", (e) => {
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> failed the challenge by revealing <span class="influence">${e.influence}</span>.`
                });
            });

            this.$events.on("playerMustDiscardInfluence", (e) => {
                var count = e.count ? e.count : 1;
                var reason = e.reason ? e.reason : 'Unknown';
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> must discard <span class="count">${count}</span> influence (Reason: <span class="reason">${reason}</span>).`,
                    actionMessage: true
                });
            });

            this.$events.on("playerExchangingCards", (e) => {
                var count = e.count ? e.count : 2;
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> is exchanging <span class="count">${count}</span> cards with the deck.`,
                    actionMessage: true
                });
            });

            this.$events.on("showPlayerInfluence", (e) => {
                this.players[e.player].influence = e.influence;
            });

            this.$events.on("chatMessage", (e) => {
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `&lt;<span class="player">${this.htmlEntities(this.players[e.player].name)}</span>&gt; <span class="message">${this.htmlEntities(e.message)}</span>`
                });
            });

            this.$events.on("serverMessage", (e) => {
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<strong>Server Message:</strong> <span class="message">${this.htmlEntities(e.message)}</span>`
                });
            });

            this.$events.on("adminMessage", (e) => {
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<strong>Admin Message:</strong> <span class="message">${this.htmlEntities(e.message)}</span>`
                });
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
</style>

<!-- These are separate so that all the elements can use them -->
<style lang="scss">
@import '@/assets/_variables.scss';

.ASSASSIN {
    background-color: $assassin-background-color;
    color: $assassin-color;

    &:hover,
    &:active {
        background-color: #{mix(white, $assassin-background-color, 15%)};
        color: $assassin-color;
    }
}

.AMBASSADOR {
    background-color: $ambassador-background-color;
    color: $ambassador-color;

    &:hover,
    &:active {
        background-color: #{mix(white, $ambassador-background-color, 25%)};
        color: $ambassador-color;
    }
}

.CAPTAIN {
    background-color: $captain-background-color;
    color: $captain-color;

    &:hover,
    &:active {
        background-color: #{mix(white, $captain-background-color, 25%)};
        color: $captain-color;
    }
}

.CONTESSA {
    background-color: $contessa-background-color;
    color: $contessa-color;

    &:hover,
    &:active {
        background-color: #{mix(white, $contessa-background-color, 25%)};
        color: $contessa-color;
    }
}

.DUKE {
    background-color: $duke-background-color;
    color: $duke-color;

    &:hover,
    &:active {
        background-color: #{mix(black, $duke-background-color, 25%)};
        color: $duke-color;
    }
}
</style>

<!-- This needs to be separate because vue doesn't actually know about these things 'cos they are in strings. -->
<style lang="scss">
.gameLog {
    .nextGame {
        font-weight: bold;
    }

    .date {
        font-weight: normal;
    }

    .player {
        font-weight: bold;
    }

    .kickedBy {
        font-weight: bold;
    }

    .reason {
        font-weight: bold;
    }

    .influence {
        font-weight: bold;
    }

    .coins {
        font-weight: bold;
    }

    .count {
        font-weight: bold;
    }

    .action {
        font-weight: bold;
    }

    .counter {
        font-weight: bold;
    }

    .target {
        font-weight: bold;
    }

    .challenger {
        font-weight: bold;
    }
}
</style>
