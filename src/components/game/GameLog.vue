<template>
    <div class="gameLog">
        Game Log:
        <button class="btn btn-sm btn-primary" v-if="!showGameLog" @click="showGameLog = true">Show</button>
        <button class="btn btn-sm btn-primary" v-if="showGameLog" @click="showGameLog = false">Hide</button>

        <ul v-if="showGameLog">
            <li v-for="(log, id) in gameLog" :key="id" class="event" :class="log.event.__type">
                [<span class="date" v-html="new Date(log.date).toLocaleTimeString()"></span>]
                <span class="logmessage" v-html="log.message"></span>
                <br v-if="log.separator">
                <br v-if="log.separator">
            </li>
        </ul>
    </div>
</template>

<script>
import emitter from 'tiny-emitter'

export default {
    props: ["actionsMessage", "initialEvents"],

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

        // This is mostly for dev, our parent keeps track of events for us to reload with.
        if (this.initialEvents.length > 0) {
            for (const event of this.initialEvents) {
                this.handleEvent(event);
            }
        }
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
                this.$emit('update:actionsMessage', logItem.message);
            }
        },

        htmlEntities(str) {
            return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        },

        addInternalHandlers() {
            this.$events.on("nextGameAvailable", (e) => {
                if (e.nextGameID) {
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
                };

                if (e.self) {
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `You joined the game as <span class="player">${this.htmlEntities(e.name)}</span>`
                    });
                } else {
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `<span class="player">${this.htmlEntities(e.name)}</span> joined the game`
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
            });

            this.$events.on("playerReady", (e) => {
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> is ready`
                });
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
            });

            this.$events.on("gameOver", (e) => {
                this.turnLog = [];

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `Game over. <span class="player">${this.htmlEntities(this.players[e.winner].name)}</span> was the winner.`,
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
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> gained <span class="coins">${e.coins}</span> coins`
                });
            });

            this.$events.on("playerLostCoins", (e) => {
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> lost <span class="coins">${e.coins}</span> coins`
                });
            });

            this.$events.on("playerSpentCoins", (e) => {
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> spent <span class="coins">${e.coins}</span> coins`
                });
            });

            this.$events.on("allocateInfluence", (e) => {
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> was allocated influence: <span class="influence">${e.influence}</span>`
                });

                // TODO: This should probably splice out the correct influence.
                this.deck.splice(0, 1);
            });

            this.$events.on("setDeck", (e) => {
                this.deck = [...e.deck];
            });

            this.$events.on("allocateNextInfluence", (e) => {
                e.influence = this.deck.shift();

                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> was allocated the next influence in the deck: <span class="influence">${e.influence}</span>`
                });
            });

            this.$events.on("discardInfluence", (e) => {
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> discarded influence: <span class="influence">${e.influence}</span>`
                });
            });

            const returnInfluenceHandler = (e) => {
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> returned influence to the deck: <span class="influence">${e.influence}</span>`,
                    actionMessage: true
                });
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
            });

            this.$events.on("playerPerformedAction", (e) => {
                if (e.target) {
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> performed action <span class="action ${e.action}">${e.actionName ? e.actionName : e.action}</span> on <span class="target">${this.htmlEntities(this.players[e.target].name)}</span>`,
                        actionMessage: true
                    });
                } else {
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> performed action <span class="action ${e.action}">${e.actionName ? e.actionName : e.action}</span>`,
                        actionMessage: true
                    });
                }
            });

            this.$events.on("counterablePlayerAction", (e) => {
                if (e.target) {
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> is attempting action <span class="action ${e.action}">${e.actionName ? e.actionName : e.action}</span> on <span class="target">${this.htmlEntities(this.players[e.target].name)}</span>`,
                        actionMessage: true
                    });
                } else {
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> is attempting action <span class="action ${e.action}">${e.actionName ? e.actionName : e.action}</span>`,
                        actionMessage: true
                    });
                }
            });

            this.$events.on("playerActionStillCounterable", (e) => {
                if (e.target) {
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> is continuing with action <span class="action ${e.action}">${e.actionName ? e.actionName : e.action}</span> on <span class="target">${this.htmlEntities(this.players[e.target].name)}</span>`,
                        actionMessage: true
                    });
                } else {
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> is continuing with action <span class="action ${e.action}">${e.actionName ? e.actionName : e.action}</span>`,
                        actionMessage: true
                    });
                }
            });

            this.$events.on("challengeablePlayerAction", (e) => {
                if (e.target) {
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> is attempting action <span class="action ${e.action}">${e.actionName ? e.actionName : e.action}</span> on <span class="target">${this.htmlEntities(this.players[e.target].name)}</span>`,
                        actionMessage: true
                    });
                } else {
                    this.addToGameLog({
                        date: e.date,
                        event: e,
                        message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> is attempting action <span class="action ${e.action}">${e.actionName ? e.actionName : e.action}</span>`,
                        actionMessage: true
                    });
                }
            });

            this.$events.on("playerPassed", (e) => {
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="player">${this.htmlEntities(this.players[e.player].name)}</span> is not challenging the action.`
                });
            });

            this.$events.on("playerWillCounter", (e) => {
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="challenger">${this.htmlEntities(this.players[e.challenger].name)}</span> will counter <span class="player">${this.htmlEntities(this.players[e.player].name)}</span>'s <span class="action ${e.action}">${e.actionName ? e.actionName : e.action}</span> with: <span class="counter ${e.counter}">${e.counterName ? e.counterName : e.counter}</span>.`,
                    actionMessage: true
                });
            });

            this.$events.on("playerCountered", (e) => {
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="challenger">${this.htmlEntities(this.players[e.challenger].name)}</span> countered <span class="player">${this.htmlEntities(this.players[e.player].name)}</span>'s <span class="action ${e.action}">${e.actionName ? e.actionName : e.action}</span> with: <span class="counter ${e.counter}">${e.counterName ? e.counterName : e.counter}</span>.`,
                    actionMessage: true
                });
            });

            this.$events.on("playerChallenged", (e) => {
                this.addToGameLog({
                    date: e.date,
                    event: e,
                    message: `<span class="challenger">${this.htmlEntities(this.players[e.challenger].name)}</span> challenged <span class="player">${this.htmlEntities(this.players[e.player].name)}</span>'s <span class="action ${e.action}">${e.actionName ? e.actionName : e.action}</span>.`,
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
