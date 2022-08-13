<template>
  <div class="playerWrapper">
    <div :class="{ 'player': true, 'ready': player.ready, 'active': player.active, 'dead': (player.influence.length == 0 && player.discardedInfluence.length > 0) }">
      <div class="name" :class="{ self: (player == self) }">
        {{ player.name }}
      </div>

      <div v-if="player.coins !== undefined" class="coins">
        Coins: {{ player.coins }}
      </div>

      <div class="influenceWrapper">
        <div class="influenceList">
          <div class="influence" :class="influence" v-for="(influence, key) in player.influence" :key="key">
            {{ influence }}
          </div>

          <div class="discarded influence" :class="influence" v-for="(influence, key) in player.discardedInfluence" :key="key">
            {{ influence }}
          </div>

          <div v-if="(player.influence.length + player.discardedInfluence.length) % 2 != 0" class="influenceSpacer"></div>
        </div>
      </div>

      <div class="actions" v-if="self != undefined">
        <span v-for="(action, actionID) in player.actions" :key="actionID">
          <button class="btn btm-sm btn-primary" @click="doPlayerAction(actionID)">{{ action.name }}</button>
        </span>
      </div>
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
@import '@/assets/_variables.scss';

.playerWrapper {
  min-width: 220px;
  padding: 10px;

  @media (max-width: 450px) {
    width: 100%;
  }

  .player {
    display: inline-block;
    width: 100%;
    min-height: 110px;
    border: 4px solid black;
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

    .influenceWrapper {
      display: flex;

      .influenceList {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        margin: 0px auto;

        @media (max-width: 450px) {
          flex-direction: row;
          justify-content: center;
        }

        .influenceSpacer {
          width: 150px;
          display: none;

          @media (max-width: 450px) {
            display: block;
            margin-left: calc(2 * 5px);
          }
        }

        .influence {
          width: 150px;
          text-align: center;
          margin: 5px;
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

          &.discarded {
            border: 2px dashed grey;
            background-color: lightgrey;
            color: black;
          }
        }
      }
    }

    .coins,
    .name {
      text-align: center;
    }

    &.ready {
      border: 4px solid green;
      background-color: white;

      html.dark-theme & {
        background-color: lightgrey;
      }
    }

    &.active {
      background-color: lightgreen !important;
    }

    &.dead {
      border: 4px solid red;
      background-color: lightcoral;

      html.dark-theme & {
        background-color: lightcoral;
      }
    }
  }
}

</style>
