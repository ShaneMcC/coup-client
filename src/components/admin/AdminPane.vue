<template>
    <div>
        <button @click="createGame">Create new Game</button>
        <br>
        <button @click="refresh">Refresh</button>
        <br>

        <hr>
        <div class="activeGames">
            <strong>Active Games</strong>
            <ul>
                <li v-for="(game, gameID) in knownGames" :key="gameID" class="game">
                    <router-link :to="'/game/' + gameID">{{ gameID }}</router-link>
                    - <span class="state">{{ game.state }}</span>
                    - <button class="btn btn-sm btn-warning" @click="endGame(gameID)">End Game</button>
                    - <button class="btn btn-sm btn-success" @click="saveGame(gameID)">Save Game</button>
                    - <button class="btn btn-sm btn-primary" @click="refreshGame(gameID)">Refresh Game</button>
                    - <button class="btn btn-sm btn-danger" @click="killGame(gameID)">Kill Game</button>

                    <ul>
                        <li v-for="(player, playerID) in game.players" :key="playerID" class="player">
                            <router-link :to="'/game/' + gameID + '/' + playerID">{{ player.name }}</router-link>
                        </li>
                    </ul>

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

export default {
    props: ['adminSocket'],

    data() {
        return {
            knownGames: {},
            savedGames: {},
        }
    },

    created() {
        this.$ioSocket = this.adminSocket;

        this.$ioSocket.on("gamesAvailable", this.handleGamesAvailable);
        this.$ioSocket.on("savedGamesAvailable", this.handleSavedGames);
        this.refresh();
    },

    unmounted() {
        this.$ioSocket.off("gamesAvailable", this.handleGamesAvailable);
        this.$ioSocket.off("savedGamesAvailable", this.handleSavedGames);
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
        }
    }
}
</script>

<style scoped lang="scss">
.activeGames {
    span.state {
        font-family: monospace;
    }
}
</style>
