<template>
  <div :class="{ 'player': true, 'ready': player.ready, 'active': player.active, 'dead': (player.influence.length == 0 && player.discardedInfluence.length > 0) }">
    <div class="name" :class="{ self: (player == self) }">
      {{ player.name }}
    </div>

    <div v-if="player.coins !== undefined" class="coins">
      Coins: {{ player.coins }}
    </div>

    <div class="influence" :class="influence" v-for="(influence, key) in player.influence" :key="key">
      {{ influence }}
    </div>

    <div class="discarded influence" :class="influence" v-for="(influence, key) in player.discardedInfluence" :key="key">
      {{ influence }}
    </div>

    <div class="actions" v-if="self != undefined">
      <span v-for="(action, actionID) in player.actions" :key="actionID">
        <button class="btn btm-sm btn-primary" @click="doPlayerAction(actionID)">{{ action.name }}</button>
      </span>
    </div>
  </div>
</template>

<script>

export default {
  inject: ['$ioSocket'],

  props: ['player', 'game', 'self'],

  methods: {
    doPlayerAction(action) {
      if (this.player.actions[action].prompt) {
        var val = prompt(this.player.actions[action].prompt);
        if (val != undefined) {
          this.$ioSocket.emit("action", this.game, action, val);
        }
      } else {
        this.$ioSocket.emit("action", this.game, action, this.player.id);
      }
    },
  }
}
</script>

<style scoped lang="scss">
.player {
  display: inline-block;
  width: 200px;
  min-height: 110px;
  border: 4px solid black;
  margin: 10px;
  padding: 5px;

  background-color: lightgrey;
  color: black;

  .name {
    &.self {
      font-weight: bold;

      &::after {
        content: ' (You)';
      }
    }
  }

  .actions {
    margin: 10px;
    text-align: center;
  }

  .influence {
    text-align: center;
    width: 150px;
    margin: 5px auto;
    padding: 3px;
    border: 2px solid black;

    text-transform: lowercase;

    &::first-letter {
      text-transform: uppercase;
    }

    &.UNKNOWN {
      background-color: white;
      color: black
    }

    &.ASSASSIN {
      background-color: black;
      color: white;
    }

    &.AMBASSADOR {
      background-color: orange;
      color: black;
    }

    &.CAPTAIN {
      background-color: navy;
      color: white;
    }

    &.CONTESSA {
      background-color: crimson;
      color: black;
    }

    &.DUKE {
      background-color: fuchsia;
      color: black;
    }

    &.discarded {
      border: 2px dashed grey;
      background-color: lightgrey;
      color: black;
    }
  }

  .coins,
  .name {
    text-align: center;
  }

  &.ready {
    border: 4px solid green;
    background-color: white;
  }

  &.active {
    background-color: lightgreen;
  }

  &.dead {
    border: 4px solid red;
    background-color: lightcoral;
  }
}

    html.dark-theme {
      .player {
          &.ready {
            background-color: lightgrey;
          }
      }
    }
</style>
