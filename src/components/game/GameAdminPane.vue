<template>
    <div>
        Game Admin for: {{ gameID }} <button class="btn btm-sm btn-success" @click="refresh">Refresh</button>
        <AlertsPane @removeAlert="removeAlert" :alerts="alerts"></AlertsPane>
        <hr>
        <div class="actions">
            <button class="btn btn-sm btn-warning" @click="endGame()">End Game</button>
            <button class="btn btn-sm btn-success" @click="saveGame()">Save Game</button>
            <button class="btn btn-sm btn-primary" @click="refreshGame()">Refresh Game</button>
            <button class="btn btn-sm btn-danger" @click="killGame()">Kill Game</button>
            <button class="btn btn-sm btn-danger" @click="reloadGame()">Reload Game</button>
            <button class="btn btn-sm btn-secondary" @click="adminEmitEvent()">Emit Event</button>
            <button class="btn btn-sm btn-secondary" @click="sendAdminMessage()">Send Message</button>
        </div>
        <hr>
        <div>
            <form class="form" @submit.prevent="sendAdminMessage">
                <div class="d-flex flex-row align-items-center flex-wrap">
                    <label for="chatMessage">Admin Message:</label>
                    <input id="chatMessage" class="form-control w-auto mx-2" v-model="adminMessage">

                    <button class="btn btn-sm btn-secondary" type="submit">Send</button>
                </div>
            </form>
        </div>

        <hr>
        <div v-if="game">
            <div class="meta">
                <strong>Created:</strong> {{ game.created }}
                <br>
                <strong>State:</strong> <span class="state">{{ game.state }}</span>
            </div>

            <div class="players">
                <h3>Players:</h3>
                <ul>
                    <li v-for="(player, playerID) in game.players" :key="playerID" class="player">
                        <router-link :to="'/game/' + gameID + '/' + playerID">{{ player.name }}</router-link>
                        <div v-if="game.started" class="actions">
                            <button class="btn btn-sm btn-danger" @click="removeCoins(playerID)">-$</button>
                            <button class="btn btn-sm btn-success" @click="giveCoins(playerID)">+$</button>
                            <button class="btn btn-sm btn-primary" @click="startPlayerTurn(playerID)">&gt;&gt;</button>
                        </div>
                    </li>
                </ul>

                <button class="btn btn-danger" @click="rollbackEvent()">&lt;&lt; Rollback Event</button>
                <button class="btn btn-primary" @click="nextPlayerTurn()">Next Turn &gt;&gt;</button>
            </div>

            <div>
                <br><br>
                <pre>{{ safeGame }}</pre>
            </div>
        </div>
    </div>
</template>

<script>
import AlertsPane from "@/components/common/AlertsPane.vue";

export default {
    props: ['adminSocket', 'gameID'],

    data() {
        return {
            alerts: [],
            game: undefined,
            adminMessage: '',
        }
    },

    computed: {
        safeGame() {
            const safeGame = JSON.parse(JSON.stringify(this.game));
            delete safeGame['players'];
            return safeGame;
        }
    },

    created() {
        this.$ioSocket = this.adminSocket;

        this.$ioSocket.on("commandError", this.handleCommandError);
        this.$ioSocket.on("error", this.handleCommandError);
        this.$ioSocket.on("success", this.handleCommandSuccess);
        this.$ioSocket.on("gamesAvailable", this.handleGamesAvailable);

        this.refresh();
    },

    unmounted() {
        this.$ioSocket.off("commandError", this.handleCommandError);
        this.$ioSocket.off("error", this.handleCommandError);
        this.$ioSocket.off("success", this.handleCommandSuccess);
        this.$ioSocket.off("gamesAvailable", this.handleGamesAvailable);
    },

    methods: {
        refresh() {
            this.$ioSocket.emit("listGames");
        },

        handleGamesAvailable(games) {
            this.game = games[this.gameID];
        },

        killGame() {
            this.$ioSocket.emit("killGame", this.gameID);
        },

        endGame() {
            this.$ioSocket.emit("endGame", this.gameID);
        },

        refreshGame() {
            this.$ioSocket.emit("refreshGame", this.gameID);
        },

        saveGame() {
            this.$ioSocket.emit("saveGame", this.gameID);
        },

        nextPlayerTurn() {
            this.$ioSocket.emit("nextPlayerTurn", this.gameID);
        },

        removeCoins(playerID, count) {
            if (count == undefined) {
                count = prompt('Coins to remove:');
                if (count == undefined) {
                    return;
                }
            }

            count = parseInt(count);
            if (count > 0) {
                this.$ioSocket.emit("removePlayerCoins", this.gameID, playerID, count);
            }
        },

        giveCoins(playerID, count) {
            if (count == undefined) {
                count = prompt('Coins to give:');
                if (count == undefined) {
                    return;
                }
            }

            count = parseInt(count);
            if (count > 0) {
                this.$ioSocket.emit("givePlayerCoins", this.gameID, playerID, count);
            }
        },

        startPlayerTurn(playerID) {
            this.$ioSocket.emit("startPlayerTurn", this.gameID, playerID);
        },

        rollbackEvent(count) {
            if (count == undefined) {
                count = prompt('Events to rollback:');
                if (count == undefined) {
                    return;
                }
            }

            count = parseInt(count);
            if (count > 0) {
                this.$ioSocket.emit("rollbackLastEvent", this.gameID, count);
            }
        },

        reloadGame() {
            this.$ioSocket.emit("reloadGame", this.gameID);
        },

        adminEmitEvent(eventData) {
            if (eventData == undefined) { eventData = prompt('Event Data:'); }
            try {
                eventData = JSON.parse(eventData);
            } catch (e) {
                eventData = false;
            }

            if (eventData) {
                if (eventData.__type) {
                    this.$ioSocket.emit("adminEmitEvent", this.gameID, eventData);
                } else {
                    this.alerts.push({ type: 'danger', message: 'Event data must include a __type field.' });
                }
            } else {
                this.alerts.push({ type: 'danger', message: 'Event data failed to parse, not emited.' });
            }
        },

        sendAdminMessage() {
            this.$ioSocket.emit("sendAdminMessage", this.gameID, this.adminMessage);
            this.adminMessage = '';
        },

        handleCommandError(event) {
            this.alerts.push({ type: 'danger', message: event.error });
        },

        handleCommandSuccess(event) {
            this.alerts.push({ type: 'success', message: event.message });
        },

        removeAlert(alertId) {
            this.alerts.splice(alertId, 1);
        },
    },

    components: { AlertsPane }
}
</script>

<style scoped lang="scss">
.actions .btn {
    margin: 5px;
}
</style>
