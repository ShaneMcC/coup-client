<template>
    <div>
        <ConnectingPane v-if="!connected" :connectErrorMessage="connectErrorMessage" @connect="connect" v-model:adminToken="adminToken">
        </ConnectingPane>

        <AdminPane v-if="connected" :adminSocket="$ioSocket">
        </AdminPane>
    </div>
</template>

<script>
import ConnectingPane from "../components/admin/ConnectingPane.vue";
import AdminPane from "../components/admin/AdminPane.vue";

export default {
    inject: ["$ioManager"],
    data() {
        return {
            connectErrorMessage: "",
            adminToken: '',
            connected: false
        };
    },
    unmounted() {
        this.disconnect();
    },
    methods: {
        connect() {
            this.$ioSocket = this.$ioManager.socket("/admin", { auth: { token: this.adminToken } });
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
    },


    components: { ConnectingPane, AdminPane }
}
</script>

<style>
</style>
