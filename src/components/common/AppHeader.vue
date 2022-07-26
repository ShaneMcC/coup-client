<template>
    <nav class="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
        <div class="container-fluid">
            <a class="navbar-brand" href="/">{{ $appConfig.siteName }}</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar"
                aria-controls="navbar" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbar">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                </ul>

                <div class="navbar-nav">
                </div>
            </div>
        </div>
    </nav>
</template>

<script>
export default {
    inject: ['$appConfig'],
}
</script>
