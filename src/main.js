import { createApp } from 'vue'
import App from './App.vue'
import router from './routes.js'
import { Manager as ioManager } from "socket.io-client";

// Load Config Settings, then launch app.
fetch('/config.json').then(async (result) => {
    const $appConfig = result.ok ? await result.json() : {server: 'ws://:3000/', 'siteName': 'Coup'}; 

    const $ioManager = new ioManager(`${$appConfig.server.replace(/\/+$/, '')}`, {autoConnect: false});
    const $ioSocket = $ioManager.socket("/gameServer");

    const app = createApp(App);
    app.use(router);

    app.provide('$ioManager', $ioManager);
    app.provide('$ioSocket', $ioSocket);
    app.provide('$appConfig', $appConfig);
    app.mount('#app'); 
});


// eslint-disable-next-line
import { _Boostrap } from 'bootstrap'