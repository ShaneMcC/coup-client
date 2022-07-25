<template>
  <div>
    <div v-if="!connected">
      Connecting to server...
    </div>

    <div v-if="connected && !inGame">
      <button @click="createGame">Create new Game</button>
      <hr>
      Player Name: <input type="text" v-model="playerName">
      Game ID: <input type="text" v-model="joinGameId">

      <button @click="joinGame">Join Game</button>
      <hr>
      Player ID: <input type="text" v-model="myPlayerID">
      Game ID: <input type="text" v-model="myGameID">

      <button @click="rejoinGame">Rejoin Game</button>
    </div>

    <div v-if="connected && inGame">
      We are {{ myPlayerID }} in {{ myGameID }}
      <hr>
      <button @click="disconnect">Disconnect</button>
      <hr>
      Perform Action: <input v-model="nextAction"> on <input v-model="nextTarget"> <button @click="doAction">Action</button>
      <hr>
      Game Events:
      <ul>
        <li v-for="(event, eventID) in gameEvents" :key="eventID">{{ event }}</li>
      </ul>
    </div>
  </div>
</template>

<script>

import { io } from "socket.io-client";

export default {
  data() {
    return {
      playerName: 'Test',
      joinGameId: '2744ef09-54bd-4435-b354-5955d3a0f1fa',
      
      connected: false,
      inGame: false,
      myPlayerID: '',
      myGameID: '',
      nextAction: '',
      nextTarget: '',

      gameEvents: []
    }
  },

  created() {
    this.$ioSocket = new io("ws://192.168.2.2:3000/gameServer");

    this.$ioSocket.on('connect', () => {
      this.connected = true;
      this.inGame = false;
      this.gameEvents = [];
    });

    this.$ioSocket.on('disconnect', () => {
      this.connected = false;
      this.inGame = false;
      this.gameEvents = [];
    });

    this.$ioSocket.on('gameCreated', (arg) => {
      this.joinGameId = arg.game;
    });

    this.$ioSocket.on("gameJoined", (arg) => {
      this.myPlayerID = arg.playerID;
      this.myGameID = arg.gameID;
      this.inGame = true;
      this.gameEvents = [];
    });

    this.$ioSocket.on("handleGameEvent", (event) => {
      this.gameEvents.unshift(event);
    });

    this.$ioSocket.on("gameLoaded", () => {
      
    });

    // this.$ioSocket.connect();
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
    },

    doAction() {
      if (this.nextAction.length == 0) {
        alert('Please enter an action.');
        return;
      }

      this.$ioSocket.emit("action", this.myGameID, this.nextAction, this.nextTarget);
      this.nextAction = '';
      this.nextTarget = '';
    }
  }
}
</script>

<style>
</style>
