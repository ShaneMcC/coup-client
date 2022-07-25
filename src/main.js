import { createApp } from 'vue'
import App from './App.vue'
import { io } from "socket.io-client";

const $ioSocket = new io("ws://:3000/gameServer", {autoConnect: false});

const app = createApp(App);
app.provide('$ioSocket', $ioSocket);
app.mount('#app')
