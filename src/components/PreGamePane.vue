<template>
  <div>
      <button @click="disconnect">Disconnect</button>
      <hr>

      <button @click="createGame">Create new Game</button>
      <hr>
      Player Name: <input type="text" :value="playerName" @input="this.$emit('update:playerName', $event.target.value);">
      Game ID: <input type="text" v-model="joinGameId">

      <button @click="joinGame">Join Game</button>
      <hr>
      Player ID: <input type="text" :value="rejoinPlayerID" @input="this.$emit('update:rejoinPlayerID', $event.target.value);">
      Game ID: <input type="text" :value="rejoinGameID" @input="this.$emit('update:rejoinGameID', $event.target.value);">

      <button @click="rejoinGame">Rejoin Game</button>
  </div>
</template>

<script>

export default {
    inject: ["$ioSocket"],
    props: ['playerName', 'rejoinPlayerID', 'rejoinGameID'],

    data() {
        return {
            joinGameId: "TestGame",
        };
    },

    mounted() {
        this.$ioSocket.on("gameCreated", (arg) => {
            this.joinGameId = arg.game;
        });
    },

    methods: {
       
        disconnect() {
            this.$ioSocket.disconnect();
        },

        createGame() {
            this.$ioSocket.emit("createGame");
        },

        joinGame() {
            if (this.playerName.length == 0) {
                alert("Please choose a player name.");
                return;
            }
            if (this.joinGameId.length == 0) {
                alert("Please enter a game ID.");
                return;
            }
            this.$ioSocket.emit("joinGame", this.joinGameId, this.playerName);
        },
        
        rejoinGame() {
            if (this.rejoinPlayerID.length == 0) {
                alert("Please enter a player id.");
                return;
            }
            if (this.rejoinGameID.length == 0) {
                alert("Please enter a game ID.");
                return;
            }
            this.$ioSocket.emit("rejoinGame", this.rejoinGameID, this.rejoinPlayerID);
        },
    },
}
</script>

<style>
</style>
