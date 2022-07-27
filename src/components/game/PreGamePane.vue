<template>
    <div>
        <form class="form" @submit.prevent="joinGame">
            <div class="d-flex flex-row align-items-center flex-wrap">
                <label for="playerName">Player Name:</label>
                <input id="playerName" class="form-control w-auto mx-2" type="text" :value="playerName" @input="this.$emit('update:playerName', $event.target.value);">
                <button class="btn btn-sm btn-success" @click.prevent="resetPlayerName">Random Name</button>
                &nbsp;
                <button class="btn btn-sm btn-primary" type="submit">Join Game</button>
            </div>
        </form>
        <br>
        <br>
        <button class="btn btn-sm btn-info" @click="spectateGame">Spectate Game</button>
    </div>
</template>

<script>

import { uniqueNamesGenerator, adjectives as adjectiveList, colors as colourList, animals as animalList } from 'unique-names-generator';

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

        resetPlayerName() {
            this.$emit('update:playerName', uniqueNamesGenerator({ dictionaries: [[...adjectiveList, ...colourList], animalList], length: 2, separator: '', style: 'capital' }));
            localStorage.removeItem('playerName');
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
