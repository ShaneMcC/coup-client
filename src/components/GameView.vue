<template>
  <div>
    Game Events:
    <ul>
    <li v-for="(event, eventID) in gameEvents" :key="eventID">{{ event }}</li>
    </ul>
  </div>
</template>

<script>

import { io } from "socket.io-client";

export default {
  data() {
    return {
      playerName: '',
      joinGameId: '',
      
      connected: false,
      inGame: false,
      myPlayerID: '',
      myGameID: '',
      gameEvents: [],
    }
  },

  created() {
    this.$ioSocket = new io("ws://192.168.2.2:3000/gameServer", { autoConnect: false });

    this.$ioSocket.on('connect', () => {
      this.connected = true;
    });

    this.$ioSocket.on('gameCreated', (arg) => {
      this.joinGameId = arg.game;
    });

    this.$ioSocket.on("gameJoined", (arg) => {
      this.playerID = arg.playerID;
      this.gameID = arg.gameID;

      this.inGame = true;
      this.gameEvents = [];
    });

    this.$ioSocket.on("handleGameEvent", (event) => {
      this.gameEvents.push(event);
    });

    this.$ioSocket.on("gameLoaded", () => {
      alert('Game Loaded');
    });

    this.$ioSocket.connect();
  },

  methods: {
    createGame() {
      this.$ioSocket.emit("createGame");
    },

    joinGame() {
      if (this.playerName.length == 0) {
        alert('Please choose a player name.');
        return;
      }

      if (this.joinGameId.length == 0) {
        alert('Please enter a game ID.');
        return;
      }

      this.$ioSocket.emit("joinGame", this.joinGameId, this.playerName);
    },

    rejoinGame() {
      if (this.myPlayerID.length == 0) {
        alert('Please enter a player id.');
        return;
      }

      if (this.myGameID.length == 0) {
        alert('Please enter a game ID.');
        return;
      }

      this.$ioSocket.emit("rejoinGame", this.myGameID, this.myPlayerID);
    }
  }
}
</script>

<style>
</style>
