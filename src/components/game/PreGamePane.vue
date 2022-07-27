<template>
    <div>
        <form class="form" @submit.prevent="joinGame">
            <div class="d-flex flex-row align-items-center flex-wrap">
                <label for="playerName">Player Name:</label>
                <input id="playerName" class="form-control w-auto mx-2" type="text" :value="playerName" @input="this.$emit('update:playerName', $event.target.value);">
                <button class="btn btn-sm btn-primary" type="submit">Join Game</button>
            </div>
        </form>
        <br>
        <br>
        <button class="btn btn-sm btn-info" @click="spectateGame">Spectate Game</button>
    </div>
</template>

<script>

export default {
    inject: ["$ioSocket"],
    props: ['playerName', 'gameID'],

    methods: {
        spectateGame() {
            if (this.gameID.length == 0) {
                alert("Please enter a game ID.");
                return;
            }
            this.$ioSocket.emit("spectateGame", this.gameID);
        },

        joinGame() {
            if (this.playerName.length == 0) {
                alert("Please choose a player name.");
                return;
            }
            if (this.gameID.length == 0) {
                alert("Please enter a game ID.");
                return;
            }
            this.$ioSocket.emit("joinGame", this.gameID, this.playerName);
        },
    },
}
</script>

<style>
</style>
