<template>
    <div>
        <strong>Create Game:</strong>
        <form class="form" @submit.prevent="createGame">
            <div class="d-flex flex-row align-items-center flex-wrap">
                <label for="newGameID">Game ID:</label>
                <input id="newGameID" class="form-control w-auto mx-2" v-model="newGameID">

                <button class="btn btn-sm btn-primary" type="submit">Create new Game</button>
            </div>
        </form>
        <br><br>

        <strong>Create Test Game:</strong>
        <form class="form" @submit.prevent="createTestGame">
            <div class="d-flex flex-row align-items-center flex-wrap">
                <label for="newTestGameID">Game ID:</label>
                <input id="newTestGameID" class="form-control w-auto mx-2" v-model="newTestGameID">

                <label for="newTestGamePlayerCount">Players:</label>
                <input id="newTestGamePlayerCount" class="form-control w-auto mx-2" v-model="newTestGamePlayerCount">

                <button class="btn btn-sm btn-primary" type="submit">Create new Test Game</button>
            </div>
        </form>
        <br><br>

        <div class="actions">
            <button v-if="!serverConfig.publicGames" @click="allowPublicGames" class="btn btn-success">Allow Public Games</button>
            <button v-if="serverConfig.publicGames" @click="disallowPublicGames" class="btn btn-danger">Disallow Public Games</button>
        </div>

        <div class="actions">
            <button @click="saveAllGames" class="btn btn-success">Save All Games</button>
            <button @click="loadAllGames" class="btn btn-primary">Load All Games</button>
            <button @click="killAllGames" class="btn btn-danger">Kill All Games</button>
            <button @click="refreshAllGames" class="btn btn-primary">Refresh All Games</button>
        </div>

        <div class="actions">
            <button @click="killServer" class="btn btn-danger">Kill Server</button>
        </div>
        <br><br>

        <AlertsPane @removeAlert="removeAlert" :alerts="alerts"></AlertsPane>
        <hr>

        <h1>Active Games <button class="btn btm-sm btn-success" @click="refresh">Refresh</button></h1>
        <div class="gameList activeGames">
            <div v-for="(game, gameID) in knownGames" :key="gameID" class="game">
                <h2>
                    <router-link :to="'/game/' + gameID">{{ gameID }}</router-link>
                </h2>
                <div class="actions">
                    <button class="btn btn-sm btn-warning" @click="endGame(gameID)">End Game</button>
                    <button class="btn btn-sm btn-success" @click="saveGame(gameID)">Save Game</button>
                    <button class="btn btn-sm btn-primary" @click="refreshGame(gameID)">Refresh Game</button>
                    <button class="btn btn-sm btn-danger" @click="killGame(gameID)">Kill Game</button>
                    <button class="btn btn-sm btn-info" @click="collectGameEvents(gameID)">Collect Events</button>
                    <button class="btn btn-sm btn-secondary" @click="adminEmitEvent(gameID)">Emit Event</button>
                </div>

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
                        </li>
                    </ul>
                </div>

                <div class="gameEvents" v-if="game.events">
                    <strong>Events:</strong>
                    <br>
                    <textarea v-model="game.events"></textarea>
                    <br>
                </div>
            </div>
        </div>

        <h1>Saved Games <button class="btn btm-sm btn-success" @click="refresh">Refresh</button></h1>
        <div class="gameList savedGames">
            <div v-for="(game, gameID) in savedGames" :key="gameID" class="game">
                <h2>{{ gameID }}</h2>
                <div class="actions">
                    <button class="btn btn-sm btn-primary" @click="loadGame(gameID)">Load Game</button>
                    <button class="btn btn-sm btn-danger" @click="removeSavedGame(gameID)">Delete</button>
                </div>
            </div>
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
            newGameID: '',
            newTestGameID: '',
            newTestGamePlayerCount: 3,
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
            this.$ioSocket.emit("createGame", this.newGameID);
        },

        createTestGame() {
            this.$ioSocket.emit("createTestGame", this.newTestGameID, this.newTestGamePlayerCount);
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

        saveAllGames() {
            this.$ioSocket.emit("saveAllGames");
        },

        loadAllGames() {
            this.$ioSocket.emit("loadAllGames");
        },

        killAllGames() {
            this.$ioSocket.emit("killAllGames");
        },

        refreshAllGames() {
            this.$ioSocket.emit("refreshAllGames");
        },

        killServer() {
            this.$ioSocket.emit("killServer");
        },

        adminEmitEvent(gameId, eventData) {
            if (eventData == undefined) { eventData = prompt('Event Data:'); }
            try {
                eventData = JSON.parse(eventData);
            } catch (e) {
                eventData = false;
            }

            if (eventData) {
                if (eventData.__type) {
                    this.$ioSocket.emit("adminEmitEvent", gameId, eventData);
                } else {
                    this.alerts.push({ type: 'danger', message: 'Event data must include a __type field.' });
                }
            } else {
                this.alerts.push({ type: 'danger', message: 'Event data failed to parse, not emited.' });
            }
        },

        loadGame(gameId) {
            this.$ioSocket.emit("loadGame", gameId);
        },

        removeSavedGame(gameId) {
            this.$ioSocket.emit("removeSavedGame", gameId);
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
.gameList {
    display: flex;
    flex-wrap: wrap;
}

.game {
    padding: 10px;
    border: 1px solid grey;
    margin: 10px;
    display: inline-block;
}

.actions .btn {
    margin: 5px;
}

.activeGames {
    span.state {
        font-family: monospace;
    }
}

.gameEvents {
    textarea {
        font-family: monospace;
        width: 100%;
        margin: 0 auto;
        height: 200px;
    }
}
</style>
