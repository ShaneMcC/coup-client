<template>
    <div>
        <ConnectingPane v-if="!connected" :connectErrorMessage="connectErrorMessage" @connect="connect" v-model:adminToken="adminToken">
        </ConnectingPane>

        <div v-if="connected">
            <button @click="logout" class="btn btn-warning">Admin log out</button>
            <br><br>

            <AdminPane :adminSocket="$ioSocket">
            </AdminPane>
        </div>
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
            connected: false,

            get adminToken() {
                return localStorage.getItem('adminToken') || '';
            },
            set adminToken(value) {
                if (value == undefined) {
                    localStorage.removeItem('adminToken');
                } else {
                    localStorage.setItem('adminToken', value);
                }
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

            localStorage.setItem('isAdmin', true);
        },

        handleConnectError(err) {
            this.connectErrorMessage = err.message;
        },

        handleDisconnect() {
            this.reset();
        },

        logout() {
            localStorage.removeItem('isAdmin');
            this.adminToken = undefined;
            this.disconnect();
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
