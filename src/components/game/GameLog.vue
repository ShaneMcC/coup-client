<template>
    <div class="gameLog">
        Game Log:
        <button class="btn btn-sm btn-primary" v-if="!showGameLog" @click="showGameLog = true">Show</button>
        <button class="btn btn-sm btn-primary" v-if="showGameLog" @click="showGameLog = false">Hide</button>

        <ul v-if="showGameLog">
            <li v-for="(log, id) in gameLog" :key="id" class="event" :class="log.event.__type">
                <span class="logdata">
                    [<span class="date" v-html="new Date(log.date).toLocaleTimeString()"></span>]
                    <span class="logmessage" v-html="log.message"></span>
                </span>
                <div class="logSeparator" v-if="log.separator">
                    <hr>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import emitter from 'tiny-emitter'

export default {
    data() {
        return {
            players: [],
            gameLog: [],
            turnLog: [],
            deck: [],
            showGameLog: true,
        }
    },

    created() {
        this.$events = new emitter();
        this.addInternalHandlers();
    },

    mounted() {
        this.$emit('ready');
    },

    unmounted() {
        delete this.$events;
        this.$events = undefined;
    },

    methods: {
        handleEvent(event) {
            this.$events.emit(event.__type, event);
        },

        addToGameLog(logItem) {
            this.gameLog.unshift(logItem);
            this.turnLog.push(logItem);

            if (logItem.actionMessage) {
                this.$emit('setActionsMessage', logItem.message);
            }
        },

        htmlEntities(str) {
            return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        },

        addInternalHandlers() {
            this.$events.on("nextGameAvailable", (e) => {
                if (e.nextGameID) {
                    const nextGameID = this.htmlEntities(e.nextGameID);
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `Next game available: <span class="nextGame"><a href="/game/${nextGameID}">${nextGameID}</span>`
                    });
                }
            });

            this.$events.on("addPlayer", (e) => {
                this.players[e.id] = {
                    "id": e.id,
                    "name": e.name,
                };

                const playerName = this.htmlEntities(e.name);

                if (e.self) {
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `You joined the game as <span class="player">${playerName}</span>`
                    });
                } else {
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `<span class="player">${playerName}</span> joined the game`
                    });
                }
            });

            this.$events.on("removePlayer", (e) => {
                const playerName = this.htmlEntities(this.players[e.player].name);
                const kickedByName = this.htmlEntities(this.players[e.kickedBy]?.name);
                const reason = this.htmlEntities(e.reason);

                if (e.kickedBy) {
                    if (e.reason) {
                        this.addToGameLog({
                            date: e.date,
                            event: e,
                            message: `<span class="player">${playerName}</span> was kicked from the game by <span class="kickedBy">${kickedByName}</span> (<span class="reason">${reason}</span>)`
                        });
                    } else {
                        this.addToGameLog({
                            date: e.date,
                            event: e,
                            message: `<span class="player">${playerName}</span> was kicked from the game by <span class="kickedBy">${kickedByName}</span>`
                        });
                    }
                } else {
                    if (e.reason) {
                        this.addToGameLog({
                            date: e.date,
                            event: e,
                            message: `<span class="player">${playerName}</span> left the game (<span class="reason">${reason}</span>)`
                        });
                    } else {
                        this.addToGameLog({
                            date: e.date,
                            event: e,
                            message: `<span class="player">${playerName}</span> left the game`
                        });
                    }
                }
            });

            this.$events.on("playerReady", (e) => {
                const playerName = this.htmlEntities(this.players[e.player].name);

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${playerName}</span> is ready`
                });
            });

            this.$events.on("playerNotReady", (e) => {
                const playerName = this.htmlEntities(this.players[e.player].name);

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${playerName}</span> is not ready`
                });
                this.players[e.player].ready = false;
            });

            this.$events.on("setPlayerName", (e) => {
                const playerName = this.htmlEntities(this.players[e.player].name);
                const newName = this.htmlEntities(e.name);

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${playerName}</span> is now <span class="player">${newName}</span>`
                });

                this.players[e.player]["name"] = e.name;
            });

            this.$events.on("gameOver", (e) => {
                const winnerName = this.htmlEntities(this.players[e.winner].name);
                this.turnLog = [];

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `Game over. <span class="player">${winnerName}</span> was the winner.`,
                    actionMessage: true
                });
            });

            this.$events.on("gameEnded", (e) => {
                this.turnLog = [];

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `Game ended. ${e.reason}`,
                    actionMessage: true
                });
            });

            this.$events.on("startGame", (e) => {
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `Game started.`,
                    actionMessage: true,
                    separator: true
                });
            });

            this.$events.on("playerGainedCoins", (e) => {
                const playerName = this.htmlEntities(this.players[e.player].name);

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${playerName}</span> gained <span class="coins">${e.coins}</span> coins`
                });
            });

            this.$events.on("playerLostCoins", (e) => {
                const playerName = this.htmlEntities(this.players[e.player].name);

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${playerName}</span> lost <span class="coins">${e.coins}</span> coins`
                });
            });

            this.$events.on("playerSpentCoins", (e) => {
                const playerName = this.htmlEntities(this.players[e.player].name);

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${playerName}</span> spent <span class="coins">${e.coins}</span> coins`
                });
            });

            this.$events.on("allocateInfluence", (e) => {
                const playerName = this.htmlEntities(this.players[e.player].name);

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${playerName}</span> was allocated influence: <span class="influence ${e.influence}">${e.influence}</span>`
                });

                // TODO: This should probably splice out the correct influence.
                this.deck.splice(0, 1);
            });

            this.$events.on("setDeck", (e) => {
                this.deck = [...e.deck];
            });

            this.$events.on("allocateNextInfluence", (e) => {
                const playerName = this.htmlEntities(this.players[e.player].name);
                e.influence = this.deck.shift();

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${playerName}</span> was allocated the next influence in the deck: <span class="influence ${e.influence}">${e.influence}</span>`
                });
            });

            this.$events.on("discardInfluence", (e) => {
                const playerName = this.htmlEntities(this.players[e.player].name);

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${playerName}</span> discarded influence: <span class="influence ${e.influence}">${e.influence}</span>`
                });
            });

            const returnInfluenceHandler = (e) => {
                const playerName = this.htmlEntities(this.players[e.player].name);

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${playerName}</span> returned influence to the deck: <span class="influence ${e.influence}">${e.influence}</span>`,
                    actionMessage: true
                });
            }
            this.$events.on("returnInfluenceToDeck", returnInfluenceHandler);
            this.$events.on("returnKnownInfluenceToDeck", returnInfluenceHandler);


            this.$events.on("beginPlayerTurn", (e) => {
                const playerName = this.htmlEntities(this.players[e.player].name);
                this.turnLog = [];

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${playerName}</span> started their turn.`,
                    actionMessage: true,
                    separator: true,
                });
            });

            this.$events.on("playerPerformedAction", (e) => {
                const playerName = this.htmlEntities(this.players[e.player].name);
                const targetName = this.htmlEntities(this.players[e.target]?.name);

                if (e.target) {
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `<span class="player">${playerName}</span> performed action <span class="action ${e.action}">${e.actionName ? e.actionName : e.action}</span> on <span class="target">${targetName}</span>`,
                        actionMessage: true
                    });
                } else {
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `<span class="player">${playerName}</span> performed action <span class="action ${e.action}">${e.actionName ? e.actionName : e.action}</span>`,
                        actionMessage: true
                    });
                }
            });

            this.$events.on("counterablePlayerAction", (e) => {
                const playerName = this.htmlEntities(this.players[e.player].name);
                const targetName = this.htmlEntities(this.players[e.target]?.name);

                if (e.target) {
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `<span class="player">${playerName}</span> is attempting action <span class="action ${e.action}">${e.actionName ? e.actionName : e.action}</span> on <span class="target">${targetName}</span>`,
                        actionMessage: true
                    });
                } else {
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `<span class="player">${playerName}</span> is attempting action <span class="action ${e.action}">${e.actionName ? e.actionName : e.action}</span>`,
                        actionMessage: true
                    });
                }
            });

            this.$events.on("playerActionStillCounterable", (e) => {
                const playerName = this.htmlEntities(this.players[e.player].name);
                const targetName = this.htmlEntities(this.players[e.target]?.name);

                if (e.target) {
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `<span class="player">${playerName}</span> is continuing with action <span class="action ${e.action}">${e.actionName ? e.actionName : e.action}</span> on <span class="target">${targetName}</span>`,
                        actionMessage: true
                    });
                } else {
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `<span class="player">${playerName}</span> is continuing with action <span class="action ${e.action}">${e.actionName ? e.actionName : e.action}</span>`,
                        actionMessage: true
                    });
                }
            });

            this.$events.on("challengeablePlayerAction", (e) => {
                const playerName = this.htmlEntities(this.players[e.player].name);
                const targetName = this.htmlEntities(this.players[e.target]?.name);

                if (e.target) {
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `<span class="player">${playerName}</span> is attempting action <span class="action ${e.action}">${e.actionName ? e.actionName : e.action}</span> on <span class="target">${targetName}</span>`,
                        actionMessage: true
                    });
                } else {
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `<span class="player">${playerName}</span> is attempting action <span class="action ${e.action}">${e.actionName ? e.actionName : e.action}</span>`,
                        actionMessage: true
                    });
                }
            });

            this.$events.on("playerPassed", (e) => {
                const playerName = this.htmlEntities(this.players[e.player].name);

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${playerName}</span> is not challenging the action.`
                });
            });

            this.$events.on("playerWillCounter", (e) => {
                const playerName = this.htmlEntities(this.players[e.player].name);
                const challengerName = this.htmlEntities(this.players[e.challenger]?.name);

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="challenger">${challengerName}</span> will counter <span class="player">${playerName}</span>'s <span class="action ${e.action}">${e.actionName ? e.actionName : e.action}</span> with: <span class="counter ${e.counter}">${e.counterName ? e.counterName : e.counter}</span>.`,
                    actionMessage: true
                });
            });

            this.$events.on("playerCountered", (e) => {
                const playerName = this.htmlEntities(this.players[e.player].name);
                const challengerName = this.htmlEntities(this.players[e.challenger]?.name);

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="challenger">${challengerName}</span> countered <span class="player">${playerName}</span>'s <span class="action ${e.action}">${e.actionName ? e.actionName : e.action}</span> with: <span class="counter ${e.counter}">${e.counterName ? e.counterName : e.counter}</span>.`,
                    actionMessage: true
                });
            });

            this.$events.on("playerChallenged", (e) => {
                const playerName = this.htmlEntities(this.players[e.player].name);
                const challengerName = this.htmlEntities(this.players[e.challenger]?.name);

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="challenger">${challengerName}</span> challenged <span class="player">${playerName}</span>'s <span class="action ${e.action}">${e.actionName ? e.actionName : e.action}</span>.`,
                    actionMessage: true
                });
            });

            this.$events.on("playerPassedChallenge", (e) => {
                const playerName = this.htmlEntities(this.players[e.player].name);

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${playerName}</span> passed the challenge by revealing <span class="influence ${e.influence}">${e.influence}</span>.`
                });
            });

            this.$events.on("playerFailedChallenge", (e) => {
                const playerName = this.htmlEntities(this.players[e.player].name);

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${playerName}</span> failed the challenge by revealing <span class="influence ${e.influence}">${e.influence}</span>.`
                });
            });

            this.$events.on("playerMustDiscardInfluence", (e) => {
                const playerName = this.htmlEntities(this.players[e.player].name);

                var count = e.count ? e.count : 1;
                var reason = e.reason ? e.reason : 'Unknown';
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${playerName}</span> must discard <span class="count">${count}</span> influence (Reason: <span class="reason">${reason}</span>).`,
                    actionMessage: true
                });
            });

            this.$events.on("playerExchangingCards", (e) => {
                const playerName = this.htmlEntities(this.players[e.player].name);

                var count = e.count ? e.count : 2;
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${playerName}</span> is exchanging <span class="count">${count}</span> cards with the deck.`,
                    actionMessage: true
                });
            });

            this.$events.on("chatMessage", (e) => {
                const playerName = this.htmlEntities(this.players[e.player].name);
                const message = this.htmlEntities(e.message);

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `&lt;<span class="player">${playerName}</span>&gt; <span class="message">${message}</span>`
                });
            });

            this.$events.on("serverMessage", (e) => {
                const message = this.htmlEntities(e.message);

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<strong>Server Message:</strong> <span class="message">${message}</span>`
                });
            });

            this.$events.on("adminMessage", (e) => {
                const message = this.htmlEntities(e.message);

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<strong>Admin Message:</strong> <span class="message">${message}</span>`
                });
            });
        },
    }
}
</script>

<style scoped lang="scss">
.gameLog {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid lightgray;
}

li.event {
    font-family: monospace;
    padding: 2px;
}
</style>

<!-- This needs to be separate because vue doesn't actually know about these things 'cos they are in strings. -->
<style lang="scss">
@import '@/assets/_variables.scss';

.gameLog {
    ul {
        list-style-type: none;
        padding: 20px;
    }

    .logSeparator {
        margin-top: 25px;
        margin-bottom: 25px;
    }

    /*
    color: grey;

    li.event.chatMessage { 
        color: black;
        html.dark-theme & {
            color: white;
        }
    }
    */

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

    .player,
    .target,
    .kickedBy,
    .challenger {
        padding: 2px;
        border: 1px solid grey;
        background-color: #D3D3D3;
        color: black;
        border-radius: 5px;
        display: inline-block;
    }

    li.event.chatMessage .player {
        border: 0;
        padding: 0;
        background-color: initial;
        color: initial;

        html.dark-theme & {
            color: white;
        }
    }

    .reason {
        font-weight: bold;
    }

    .influence {
        font-weight: bold;

        padding: 2px;
        border: 1px solid grey;
        border-radius: 5px;
        display: inline-block;

        &.UNKNOWN {
            background-color: white;
            color: black;
        }
    }

    .coins {
        font-weight: bold;
    }

    .count {
        font-weight: bold;
    }

    .counter,
    .action {
        font-weight: bold;

        padding: 2px;
        border: 1px solid grey;
        border-radius: 5px;
        display: inline-block;

        background-color: #212529;
        color: #fff;
    }

    .action {
        &.TAX {
            background-color: #{$duke-background-color};
            color: #{$duke-color};
        }

        &.EXCHANGE {
            background-color: #{$ambassador-background-color};
            color: #{$ambassador-color};
        }

        &.ASSASSINATE {
            background-color: #{$assassin-background-color};
            color: #{$assassin-color};
        }

        &.STEAL {
            background-color: #{$captain-background-color};
            color: #{$captain-color};
        }
    }

    .counter {
        &.BLOCK_FOREIGN_AID {
            background-color: #{$duke-background-color};
            color: #{$duke-color};
        }

        &.BLOCK_STEAL_WITH_AMBASSADOR {
            background-color: #{$ambassador-background-color};
            color: #{$ambassador-color};
        }

        &.BLOCK_ASSASSINATE {
            background-color: #{$contessa-background-color};
            color: #{$contessa-color};
        }

        &.BLOCK_STEAL_WITH_CAPTAIN {
            background-color: #{$captain-background-color};
            color: #{$captain-color};
        }
    }

    .target {
        font-weight: bold;
    }

    .challenger {
        font-weight: bold;
    }
}
</style>
