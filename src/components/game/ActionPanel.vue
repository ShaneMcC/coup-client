<template>
    <span>
        <button class="btn btn-dark" :class="classes" :disabled="(action.requiredCoins && action.requiredCoins > players[myPlayerID].coins) || action.disabled" @click="doAction()">{{ action.name }}</button>
    </span>
</template>

<script>

export default {
    inject: ['$ioSocket'],

    props: ['actionID', 'action', 'players', 'myGameID', 'myPlayerID'],

    computed: {
        classes() {
            const classes = [];

            if (this.action.classes) {
                for (const c of this.action.classes) {
                    classes.push(c);
                }
            }

            if (this.action.validCards) {
                for (const c of this.action.validCards) {
                    classes.push(c);
                }
            }

            classes.push(this.actionID);

            return classes;
        }
    },

    methods: {
        doAction() {
            var actionName = this.action.action ? this.action.action : this.actionID;

            if (this.action.confirm) {
                if (confirm(this.action.confirm)) {
                    this.$ioSocket.emit("action", this.myGameID, actionName, val);
                }
            } else if (this.action.prompt) {
                var val = prompt(this.action.prompt);

                if (val != undefined && val != null) {
                    // TODO: This probably shouldn't be here.
                    if (actionName == 'SETNAME') { localStorage.setItem('playerName', val); }

                    this.$ioSocket.emit("action", this.myGameID, actionName, val);
                }
            } else if (this.action.options) {
                // Replace actions with options.
                var optionActions = {};

                for (const [k, v] of Object.entries(this.action.options)) {
                    optionActions[actionName + '_' + k] = {
                        'name': this.action.name + ': ' + v,
                        'action': actionName,
                        'target': v,
                        'oneTime': this.action.oneTime,
                        'classes': [...this.classes, v],
                    }
                }

                this.$emit('newActions', optionActions);
            } else if (this.action.hasTarget) {
                // Replace actions with targets.
                var targetActions = {};

                for (const [k, v] of Object.entries(this.players)) {
                    if (v.id == this.myPlayerID) { continue; }
                    if (v.influence == 0) { continue; }

                    targetActions[actionName + '_' + k] = {
                        'name': this.action.name + ': ' + v.name,
                        'action': actionName,
                        'target': v.id,
                        'oneTime': this.action.oneTime,
                        'classes': this.classes,
                    }
                }

                this.$emit('newActions', targetActions);
            } else if (this.action.target) {
                this.$ioSocket.emit("action", this.myGameID, actionName, this.action.target);
            } else if (this.actionID == 'STARTGAME') {
                this.$emit('startGame');
            } else {
                this.$ioSocket.emit("action", this.myGameID, actionName);
            }

            if (this.action.oneTime) {
                this.$emit('deleteAction', this.actionID);
            }
        },
    }
}
</script>

<style scoped lang="scss">

button {
    padding: 10px 20px;
    margin: 10px;
}
</style>
