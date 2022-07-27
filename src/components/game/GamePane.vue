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

                <div class="d-flex flex-nowrap">
                    <div>
                        <PlayerPanel :game="myGameID" :self="players[myPlayerID]" :player="deckPlayer"></PlayerPanel>
                    </div>
                    <div>
                        <div class="playerPanels">
                            <PlayerPanel v-for="(player, playerID) in players" :key="playerID" :game="myGameID" :player="player" :self="players[myPlayerID]"></PlayerPanel>
                        </div>
                    </div>
                </div>
            </div>

            <div class="actions" v-if="players[myPlayerID]">
                <strong>{{ actionsMessage }}</strong>
                <br>
                Available Actions:

                <div class="actionPanels">
                    <ActionPanel v-for="(action, actionID) in availableActions" :key="actionID" :myGameID="myGameID" :myPlayerID="myPlayerID" :players="players" :action="action" :actionID="actionID" @newActions="newActions" @deleteAction="deleteAction"></ActionPanel>

                    <div v-if="Object.keys(availableActions).length == 0" class="actionPanels">
                        <strong>No actions available.</strong>
                    </div>

                    <form class="form" @submit.prevent="sendChatMessage">
                        <div class="d-flex flex-row align-items-center flex-wrap">
                            <label for="chatMessage">Chat:</label>
                            <input id="chatMessage" class="form-control w-auto mx-2" v-model="chatMessage">

                            <button class="btn btn-sm btn-primary" type="submit">Send</button>
                        </div>
                    </form>
                </div>


            </div>

            <div class="gameLog">
                Game Log:
                <button class="btn btn-sm btn-primary" v-if="!showGameLog" @click="showGameLog = true">Show</button>
                <button class="btn btn-sm btn-primary" v-if="showGameLog" @click="showGameLog = false">Hide</button>

                <ul v-if="showGameLog">
                    <li v-for="(log, id) in gameLog" :key="id" class="event">
                        [<span class="date" v-html="new Date(log.date).toLocaleTimeString()"></span>]
                        <span class="date" v-html="log.message"></span>
                        <br v-if="log.separator">
                        <br v-if="log.separator">
                    </li>
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

        console.log('Created');

        // This is mostly for dev, our parent keeps track of events for us to reload with.
        if (this.initialEvents.length > 0) {
            for (const event of this.initialEvents) {
                console.log('SPECIAL: ' + JSON.stringify(event));
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
                        message: `You joined the game as ${this.htmlEntities(this.players[e.id].name)}`
                    });
                } else {
                    this.addToGameLog({
                        date: e.date,
                        message: `${this.htmlEntities(this.players[e.id].name)} joined the game`
                    });
                }
            });

            this.$events.on("removePlayer", (e) => {
                if (e.kickedBy) {
                    if (e.reason) {
                        this.addToGameLog({
                            date: e.date,
                            message: `${this.htmlEntities(this.players[e.id].name)} was kicked from the game by ${this.htmlEntities(this.players[e.kickedBy].name)} (${this.htmlEntities(e.reason)})`
                        });
                    } else {
                        this.addToGameLog({
                            date: e.date,
                            message: `${this.htmlEntities(this.players[e.id].name)} was kicked from the game by ${this.htmlEntities(this.players[e.kickedBy].name)}`
                        });
                    }
                } else {
                    if (e.reason) {
                        this.addToGameLog({
                            date: e.date,
                            message: `${this.htmlEntities(this.players[e.id].name)} left the game (${this.htmlEntities(e.reason)})`
                        });
                    } else {
                        this.addToGameLog({
                            date: e.date,
                            message: `${this.htmlEntities(this.players[e.id].name)} left the game`
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
                    message: `${this.htmlEntities(this.players[e.player].name)} is ready`
                });
                this.players[e.player].ready = true;
            });

            this.$events.on("playerNotReady", (e) => {
                this.addToGameLog({
                    date: e.date,
                    message: `${this.htmlEntities(this.players[e.player].name)} is not ready`
                });
                this.players[e.player].ready = false;
            });

            this.$events.on("setPlayerName", (e) => {
                this.addToGameLog({
                    date: e.date,
                    message: `${this.htmlEntities(this.players[e.player].name)} is now ${this.htmlEntities(e.name)}`
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
                    message: `Game over. ${this.htmlEntities(this.players[e.winner].name)} was the winner.`,
                    actionMessage: true
                });

                this.activePlayer = e.winner;
                this.players[this.activePlayer].active = true;
            });

            this.$events.on("gameEnded", (e) => {
                this.turnLog = [];

                this.addToGameLog({
                    date: e.date,
                    message: `Game ended. ${e.reason}`,
                    actionMessage: true
                });

                this.activePlayer = undefined;
                this.players[this.activePlayer].active = false;
            });

            this.$events.on("startGame", (e) => {
                this.addToGameLog({
                    date: e.date,
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
                    message: `${this.htmlEntities(this.players[e.player].name)} gained ${e.coins} coins`
                });

                this.players[e.player].coins += e.coins;
            });

            this.$events.on("playerLostCoins", (e) => {
                this.addToGameLog({
                    date: e.date,
                    message: `${this.htmlEntities(this.players[e.player].name)} lost ${e.coins} coins`
                });

                this.players[e.player].coins -= e.coins;
            });

            this.$events.on("playerSpentCoins", (e) => {
                this.addToGameLog({
                    date: e.date,
                    message: `${this.htmlEntities(this.players[e.player].name)} spent ${e.coins} coins`
                });

                this.players[e.player].coins -= e.coins;
            });

            this.$events.on("setDeck", (e) => {
                this.deck = e.deck;
            });

            this.$events.on("allocateInfluence", (e) => {
                this.addToGameLog({
                    date: e.date,
                    message: `${this.htmlEntities(this.players[e.player].name)} was allocated influence: ${e.influence}`
                });

                this.players[e.player].influence.push(e.influence);
                this.deck.splice(0, 1);
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
                this.addToGameLog({
                    date: e.date,
                    message: `${this.htmlEntities(this.players[e.player].name)} discarded influence: ${e.influence}`
                });
                this.players[e.player].discardedInfluence.push(e.influence);
            });

            this.$events.on("returnInfluenceToDeck", (e) => {
                discardInfluenceHandler(e);
                this.addToGameLog({
                    date: e.date,
                    message: `${this.htmlEntities(this.players[e.player].name)} returned influence to the deck: ${e.influence}`,
                    actionMessage: true
                });

                this.deck.push(e.influence);
            });

            this.$events.on("beginPlayerTurn", (e) => {
                this.turnLog = [];

                this.addToGameLog({
                    date: e.date,
                    message: `${this.htmlEntities(this.players[e.player].name)} started their turn.`,
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
                        message: `${this.htmlEntities(this.players[e.player].name)} performed action ${e.action} on ${this.htmlEntities(this.players[e.target].name)}`,
                        actionMessage: true
                    });
                } else {
                    this.addToGameLog({
                        date: e.date,
                        message: `${this.htmlEntities(this.players[e.player].name)} performed action ${e.action}`,
                        actionMessage: true
                    });
                }
            });

            this.$events.on("counterablePlayerAction", (e) => {
                if (e.target) {
                    this.addToGameLog({
                        date: e.date,
                        message: `${this.htmlEntities(this.players[e.player].name)} is attempting action ${e.action} on ${this.htmlEntities(this.players[e.target].name)}`,
                        actionMessage: true
                    });
                } else {
                    this.addToGameLog({
                        date: e.date,
                        message: `${this.htmlEntities(this.players[e.player].name)} is attempting action ${e.action}`,
                        actionMessage: true
                    });
                }
            });

            this.$events.on("challengeablePlayerAction", (e) => {
                if (e.target) {
                    this.addToGameLog({
                        date: e.date,
                        message: `${this.htmlEntities(this.players[e.player].name)} is attempting action ${e.action} on ${this.htmlEntities(this.players[e.target].name)}`,
                        actionMessage: true
                    });
                } else {
                    this.addToGameLog({
                        date: e.date,
                        message: `${this.htmlEntities(this.players[e.player].name)} is attempting action ${e.action}`,
                        actionMessage: true
                    });
                }
            });

            this.$events.on("playerPassed", (e) => {
                this.addToGameLog({
                    date: e.date,
                    message: `${this.htmlEntities(this.players[e.player].name)} allowed the action.`
                });
            });

            this.$events.on("playerCountered", (e) => {
                this.addToGameLog({
                    date: e.date,
                    message: `${this.htmlEntities(this.players[e.challenger].name)} countered ${this.htmlEntities(this.players[e.challenger].name)}'s ${e.action} with: ${e.counter}.`,
                    actionMessage: true
                });
            });

            this.$events.on("playerChallenged", (e) => {
                this.addToGameLog({
                    date: e.date,
                    message: `${this.htmlEntities(this.players[e.challenger].name)} challenged ${this.htmlEntities(this.players[e.challenger].name)}'s ${e.action} with: ${e.counter}.`,
                    actionMessage: true
                });
            });

            this.$events.on("playerPassedChallenge", (e) => {
                this.addToGameLog({
                    date: e.date,
                    message: `${this.htmlEntities(this.players[e.player].name)} passed the challenge by revealing ${e.influence}.`
                });
            });

            this.$events.on("playerFailedChallenge", (e) => {
                this.addToGameLog({
                    date: e.date,
                    message: `${this.htmlEntities(this.players[e.player].name)} failed the challenge.`
                });
            });

            this.$events.on("playerMustDiscardInfluence", (e) => {
                var count = e.count ? e.count : 1;
                var reason = e.reason ? e.reason : 'Unknown';
                this.addToGameLog({
                    date: e.date,
                    message: `${this.htmlEntities(this.players[e.player].name)} must discard ${count} influence (Reason: ${reason}).`,
                    actionMessage: true
                });
            });

            this.$events.on("playerExchangingCards", (e) => {
                var count = e.count ? e.count : 2;
                this.addToGameLog({
                    date: e.date,
                    message: `${this.htmlEntities(this.players[e.player].name)} is exchanging ${count} cards with the deck.`,
                    actionMessage: true
                });
            });

            this.$events.on("showPlayerInfluence", (e) => {
                this.players[e.player].influence = e.influence;
            });

            this.$events.on("chatMessage", (e) => {
                this.addToGameLog({
                    date: e.date,
                    message: `&lt;${this.htmlEntities(this.players[e.player].name)}&gt; ${this.htmlEntities(e.message)}`
                });
            });

            this.$events.on("serverMessage", (e) => {
                this.addToGameLog({
                    date: e.date,
                    message: `<strong>Server Message:</strong> ${this.htmlEntities(e.message)}`
                });
            });

            this.$events.on("adminMessage", (e) => {
                this.addToGameLog({
                    date: e.date,
                    message: `<strong>Admin Message:</strong> ${this.htmlEntities(e.message)}`
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

.playerPanels {
    display: flex;
    flex-wrap: wrap;
}

li.event {
    font-family: monospace;
}
</style>
