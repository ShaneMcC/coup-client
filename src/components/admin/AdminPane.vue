<template>
    <div>
        <button @click="createGame">Create new Game</button>
        <br><br>
        <button @click="refresh">Refresh</button>
        <br><br>
        <button v-if="!serverConfig.publicGames" @click="allowPublicGames">Allow Public Games</button>
        <button v-if="serverConfig.publicGames" @click="disallowPublicGames">Disallow Public Games</button>
        <br><br>

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
                    - <button class="btn btn-sm btn-info" @click="collectGameEvents(gameID)">Collect Events</button>

                    <br><strong>Created:</strong> {{ game.created }}
                    <br><strong>State:</strong> <span class="state">{{ game.state }}</span>

                    <br><strong>Players:</strong>
                    <ul>
                        <li v-for="(player, playerID) in game.players" :key="playerID" class="player">
                            <router-link :to="'/game/' + gameID + '/' + playerID">{{ player.name }}</router-link>
                        </li>
                    </ul>
                    <br>
                    <div class="gameEvents" v-if="game.events">
                        <strong>Events:</strong>
                        <br>
                        <textarea v-model="game.events"></textarea>
                        <br>
                    </div>
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
            serverConfig: {},
        }
    },

    created() {
        this.$ioSocket = this.adminSocket;

        this.$ioSocket.on("gamesAvailable", this.handleGamesAvailable);
        this.$ioSocket.on("savedGamesAvailable", this.handleSavedGames);
        this.$ioSocket.on("serverConfig", this.handleServerConfig);
        this.$ioSocket.on("commandError", this.handleCommandError);
        this.$ioSocket.on("error", this.handleCommandError);
        this.$ioSocket.on("success", this.handleCommandSuccess);
        this.$ioSocket.on("gameEventsCollected", this.handleGameEventsCollected);

        this.refresh();
    },

    unmounted() {
        this.$ioSocket.off("gamesAvailable", this.handleGamesAvailable);
        this.$ioSocket.off("savedGamesAvailable", this.handleSavedGames);
        this.$ioSocket.off("serverConfig", this.handleServerConfig);
        this.$ioSocket.off("commandError", this.handleCommandError);
        this.$ioSocket.off("error", this.handleCommandError);
        this.$ioSocket.off("success", this.handleCommandSuccess);
        this.$ioSocket.off("gameEventsCollected", this.handleGameEventsCollected);
    },

    methods: {
        createGame() {
            this.$ioSocket.emit("createGame");
        },

        allowPublicGames() {
            this.$ioSocket.emit("allowPublicGames");
        },

        disallowPublicGames() {
            this.$ioSocket.emit("disallowPublicGames");
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

        collectGameEvents(gameId) {
            this.$ioSocket.emit("collectGameEvents", gameId);
        },

        saveGame(gameId) {
            this.$ioSocket.emit("saveGame", gameId);
        },

        loadGame(gameId) {
            this.$ioSocket.emit("loadGame", gameId);
        },

        refresh() {
            this.$ioSocket.emit("listGames");
            this.$ioSocket.emit("getServerConfig");
        },

        handleGamesAvailable(games) {
            this.knownGames = games;
        },

        handleSavedGames(games) {
            this.savedGames = games;
        },

        handleServerConfig(serverConfig) {
            this.serverConfig = serverConfig;
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

        handleGameEventsCollected(event) {
            this.knownGames[event.game]['events'] = JSON.stringify(event.events, null, 2);
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

.gameEvents {
    textarea {
        width: 80%;
        margin: 0 auto;
        height: 200px;
    }
}
</style>
