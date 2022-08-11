<template>
    <div>
        <ConnectingPane v-if="!connected" :connectErrorMessage="connectErrorMessage" @connect="connect" v-model:adminToken="adminToken">
        </ConnectingPane>

        <GameAdminPane ref="adminPane" v-if="connected" :adminSocket="$ioSocket" :gameID="gameID">
        </GameAdminPane>
    </div>
</template>

<script>
import ConnectingPane from "../components/admin/ConnectingPane.vue";
import GameAdminPane from "../components/game/GameAdminPane.vue";

export default {
    inject: ["$ioManager"],

    props: ['gameID'],

    data() {
        return {
            connectErrorMessage: "",
            connected: false,

            get adminToken() {
                return localStorage.getItem('adminToken') || '';
            },
            set adminToken(value) {
                localStorage.setItem('adminToken', value);
            }
        };
    },
    unmounted() {
        this.disconnect();
    },
    mounted() {
        if (this.adminToken != '') {
            this.connect();
        }
    },
    methods: {
        connect() {
            if (this.$ioSocket) {
                this.$ioSocket.disconnect();
                delete this.$ioSocket;
            }

            this.$ioSocket = this.$ioManager.socket("/admin", { auth: { token: this.adminToken } });
            this.$ioSocket.auth.token = this.adminToken; // Force the change as the above sometimes doesn't.
            this.$ioSocket.on("connect", this.handleConnect);
            this.$ioSocket.on("connect_error", this.handleConnectError);
            this.$ioSocket.on("disconnect", this.handleDisconnect);
            this.$ioSocket.connect();
        },

        disconnect() {
            this.reset();

            if (this.$ioSocket) {
                this.$ioSocket.disconnect();
                delete this.$ioSocket;
            }
        },

        handleConnect() {
            this.reset();
            this.connected = true;
        },

        handleConnectError(err) {
            this.connectErrorMessage = err.message;
        },

        handleDisconnect() {
            this.reset();
        },

        reset() {
            this.connected = false;
            this.connectErrorMessage = "";
        },

        rollbackUntil(date) {
            this.$refs.adminPane?.rollbackUntil(date);
        },
    },


    components: { ConnectingPane, GameAdminPane }
}
</script>

<style>
</style>
