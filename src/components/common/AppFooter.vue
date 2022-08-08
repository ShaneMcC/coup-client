<template>
    <footer class="footer">
        <div class="container-fluid">
            <hr>
            <p class="text-muted">
                <small>
                    <a href="https://github.com/shanemcc/coup-client">coup-client{{ $appConfig.gitVersion != 'Unknown' ? ' v' + $appConfig.gitVersion : ''}}</a>
                    - <a href="https://github.com/shanemcc/coup-server">coup-server{{ serverVersion != 'Unknown' ? ' v' + serverVersion : ''}}</a>
                    <br>
                    &copy; Shane 'Dataforce' Mc Cormack
                </small>
            </p>
        </div>
    </footer>
</template>

<script>
export default {
    inject: ['$appConfig', '$ioSocket'],

    data() {
        return {
            serverVersion: 'Unknown',
        }
    },

    created() {
        this.$ioSocket.on("clientConnected", this.handleClientConnected);
    },

    unmounted() {
        this.$ioSocket.off("clientConnected", this.handleClientConnected);
    },

    methods: {
        handleClientConnected(args) {
            this.serverVersion = args.serverVersion ? args.serverVersion : 'Unknown';
        },
    }
}
</script>


<style scoped lang="scss">
.footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 70px;

    hr {
        margin-bottom: 2px;
    }

    p {
        text-align: right;
        @media (max-width: 450px) {
            text-align: center;
        }
    }
}

</style>