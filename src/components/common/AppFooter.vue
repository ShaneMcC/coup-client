<template>
    <footer class="footer">
        <div class="container-fluid">
            <hr>
            <p class="text-muted">
                <small><a href="https://github.com/shanemcc/coup-client">coup-client{{ $appConfig.gitVersion != 'Unknown' ? ' v' + $appConfig.gitVersion : ''}}</a> - &copy; Shane 'Dataforce' Mc Cormack</small>
            </p>
        </div>
    </footer>
</template>

<script>
export default {
    inject: ['$appConfig'],
}
</script>


<style scoped lang="scss">
.footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 60px;
    hr {
        margin-bottom: 2px;
    }

    p {
        text-align: right;
    }
}

</style>