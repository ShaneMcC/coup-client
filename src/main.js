import { createApp } from 'vue'
import App from './App.vue'
import { io } from "socket.io-client";

// Load Config Settings, then launch app.
fetch('config.json').then(async (result) => {
    const $appConfig = result.ok ? await result.json() : {};  
    const $ioSocket = new io(`${$appConfig.server.replace(/\/+$/, '')}/gameServer`, {autoConnect: false});

    const app = createApp(App);
    app.provide('$ioSocket', $ioSocket);
    app.provide('$appConfig', $appConfig);
    app.mount('#app'); 
});