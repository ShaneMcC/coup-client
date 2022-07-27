<template>
  <div :class="{ 'player': true, 'ready': player.ready, 'active': player.active, 'dead': (player.influence.length == 0 && player.discardedInfluence.length > 0) }">
    <div class="name">
      {{ player.name }} <span v-if="player == self">(You)</span>
    </div>

    <div class="coins">
      Coins: {{ player.coins }}
    </div>

    <div class="influence" v-for="(influence, key) in player.influence" :key="key">
      {{ influence }}
    </div>

    <div class="discarded influence" v-for="(influence, key) in player.discardedInfluence" :key="key">
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

  .actions {
    margin: 10px;
    text-align: center;
  }

  .influence {
    text-align: center;
    width: 150px;
    margin: 5px auto;
    padding: 3px;
    border: 4px solid black;

    &.discarded {
      border: 2px dashed grey;
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
</style>
