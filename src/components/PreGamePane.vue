<template>
  <div>
      Player Name: <input type="text" :value="playerName" @input="this.$emit('update:playerName', $event.target.value);">
      <button @click="joinGame">Join Game</button>
  </div>
</template>

<script>

export default {
    inject: ["$ioSocket"],
    props: ['playerName', 'playerID', 'gameID'],

    methods: {   
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
