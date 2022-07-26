import { createApp } from 'vue'
import App from './App.vue'
import router from './routes.js'

import { io } from "socket.io-client";

// Load Config Settings, then launch app.
fetch('/config.json').then(async (result) => {
    const $appConfig = result.ok ? await result.json() : {server: 'ws://:3000/', 'siteName': 'Coup'}; 
    const $ioSocket = new io(`${$appConfig.server.replace(/\/+$/, '')}/gameServer`, {autoConnect: false});

    const app = createApp(App);
    app.use(router);

    app.provide('$ioSocket', $ioSocket);
    app.provide('$appConfig', $appConfig);
    app.mount('#app'); 
});