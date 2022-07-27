<template>
    <div>
        <button @click="createGame">Create new Game</button>
        <br>
        <button @click="refresh">Refresh</button>
        <br>

        <AlertsPane @removeAlert="removeAlert" :alerts="alerts"></AlertsPane>

        <hr>
        <div class="activeGames">
            <strong>Active Games</strong>
            <ul>
                <li v-for="(game, gameID) in knownGames" :key="gameID" class="game">
                    <router-link :to="'/game/' + gameID">{{ gameID }}</router-link>
                    - <button class="btn btn-sm btn-warning" @click="endGame(gameID)">End Game</button>
                    - <button class="btn btn-sm btn-success" @click="saveGame(gameID)">Save Game</button>
                    - <button class="btn btn-sm btn-primary" @click="refreshGame(gameID)">Refresh Game</button>
                    - <button class="btn btn-sm btn-danger" @click="killGame(gameID)">Kill Game</button>

                    <br><strong>Created:</strong> {{ game.created }}
                    <br><strong>State:</strong> <span class="state">{{ game.state }}</span>

                    <br><strong>Players:</strong> 
                    <ul>
                        <li v-for="(player, playerID) in game.players" :key="playerID" class="player">
                            <router-link :to="'/game/' + gameID + '/' + playerID">{{ player.name }}</router-link>
                        </li>
                    </ul>
                    <br>
                </li>
            </ul>
        </div>
        <hr>
        <div class="savedGames">
            <strong>Saved Games</strong>
            <ul>
                <li v-for="(game, gameID) in savedGames" :key="gameID" class="game">
                    {{ gameID }}
                    <button class="btn btn-sm btn-primary" @click="loadGame(gameID)">Load Game</button>
                </li>
            </ul>
        </div>

    </div>
</template>

<script>
import AlertsPane from "@/components/common/AlertsPane.vue";

export default {
    props: ['adminSocket'],

    data() {
        return {
            knownGames: {},
            savedGames: {},
            alerts: [],
        }
    },

    created() {
        this.$ioSocket = this.adminSocket;

        this.$ioSocket.on("gamesAvailable", this.handleGamesAvailable);
        this.$ioSocket.on("savedGamesAvailable", this.handleSavedGames);
        this.$ioSocket.on("commandError", this.handleCommandError);
        this.$ioSocket.on("error", this.handleCommandError);
        this.$ioSocket.on("success", this.handleCommandSuccess);
        this.refresh();
    },

    unmounted() {
        this.$ioSocket.off("gamesAvailable", this.handleGamesAvailable);
        this.$ioSocket.off("savedGamesAvailable", this.handleSavedGames);
        this.$ioSocket.off("commandError", this.handleCommandError);
        this.$ioSocket.off("error", this.handleCommandError);
        this.$ioSocket.off("success", this.handleCommandSuccess);
    },

    methods: {
        createGame() {
            this.$ioSocket.emit("createGame");
        },

        killGame(gameId) {
            this.$ioSocket.emit("killGame", gameId);
        },

        endGame(gameId) {
            this.$ioSocket.emit("endGame", gameId);
        },

        refreshGame(gameId) {
            this.$ioSocket.emit("refreshGame", gameId);
        },

        saveGame(gameId) {
            this.$ioSocket.emit("saveGame", gameId);
        },

        loadGame(gameId) {
            this.$ioSocket.emit("loadGame", gameId);
        },

        refresh() {
            this.$ioSocket.emit("listGames");
        },

        handleGamesAvailable(games) {
            this.knownGames = games;
        },

        handleSavedGames(games) {
            this.savedGames = games;
        },

        handleCommandError(event) {
            this.alerts.push({type: 'danger', message: event.error});
        },

        handleCommandSuccess(event) {
            this.alerts.push({type: 'success', message: event.message});
        },

        removeAlert(alertId) {
            this.alerts.splice(alertId, 1);
        },
    },

    components: { AlertsPane }
}
</script>

<style scoped lang="scss">
.activeGames {
    span.state {
        font-family: monospace;
    }
}
</style>
