<template>
    <div>
        <div v-if="enabledVariants.length > 0" class="alert alert-primary alert-dismissible">
            <strong>Note:</strong> This game has some rule variants enabled on top of the standard rules. This page will show rules including any modifications due to the enabled variants.
            <br><br>
            <strong>Variants Enabled:</strong> {{ enabledVariants.join(', ') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        <div class="text-center">
            <div class="gameRules">
                During your turn you can take exactly 1 action from the below list. You must coup if you have 10 or more coins.
                <br><br>
                After an action has been taken, if applicable other players will be allowed challege or allow the action, or take a counteraction (which can also be challenged or allowed). Challenges on the action are resolved before counteractions.
                <br><br>
                If a challenge occurs, then the challenged player must reveal an influence. If it is the correct influence for the action/counteraction then it will be exchanged with the deck for a new one and the challenger will lose an influence and the action/counteraction will continue as appropriate, otherwise it will be discarded and the action will not continue.
                <br><br>
                Players are out of the game when they have no more influence remaining.
            </div>
        </div>
        <div style="max-width: 100%; overflow-x: auto;">
            <table class="table table-bordered text-center align-middle">
                <thead>
                    <tr>
                        <th>Influences</th>
                        <th>Action</th>
                        <th>Effect</th>
                        <th>Counteraction</th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td>&mdash;</td>
                        <td>Income</td>
                        <td>Gain 1 coin</td>
                        <td>&mdash;</td>
                    </tr>

                    <tr>
                        <td>&mdash;</td>
                        <td>Foreign Aid</td>
                        <td>Gain 2 coins</td>
                        <td>&mdash;</td>
                    </tr>

                    <tr>
                        <td>&mdash;</td>
                        <td>Coup</td>
                        <td>Pay 7 coins<br>
                        <small v-if="variants.CallTheCoup">Target a player and pick an influence for them to lose if they have it, otherwise they lose no influence</small>
                        <small v-else>Make any player lose 1 influence</small>
                        </td>
                        <td>&mdash;</td>
                    </tr>

                    <tr class="DUKE">
                        <td>DUKE</td>
                        <td>TAX</td>
                        <td>Gain 3 coins</td>
                        <td>Block Foreign Aid</td>
                    </tr>

                    <tr class="ASSASSIN">
                        <td>ASSASSIN</td>
                        <td>ASSASSINATE</td>
                        <td>Pay 3 coins<br><small>Make any player lose 1 influence</small></td>
                        <td>&mdash;</td>
                    </tr>

                    <tr class="AMBASSADOR">
                        <td>AMBASSADOR</td>
                        <td>EXCHANGE</td>
                        <td>Draw 2 influence, discard any 2 influence back into the deck</td>
                        <td>Block STEAL</td>
                    </tr>

                    <tr class="CAPTAIN">
                        <td>CAPTAIN</td>
                        <td>STEAL</td>
                        <td>Take 2 coins from another player</td>
                        <td>Block STEAL</td>
                    </tr>

                    <tr class="CONTESSA">
                        <td>CONTESSA</td>
                        <td>&mdash;</td>
                        <td>&mdash;</td>
                        <td>Block ASSASSINATE</td>
                    </tr>
                </tbody>

                <tfoot>
                    <tr>
                        <th>Influences</th>
                        <th>Action</th>
                        <th>Effect</th>
                        <th>Counteraction</th>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
</template>

<script>
export default {
    props: ['variants'],

    computed: {
        enabledVariants() {
            return Object.keys(this.variants).filter(v => this.variants[v] );
        }
    }
}
</script>


<style scoped lang="scss">
div.modal-content div.gameRules {
    font-size: 0.875em;
}
</style>