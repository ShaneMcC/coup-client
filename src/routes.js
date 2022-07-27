import { createWebHistory, createRouter } from "vue-router";

import GamePage from "@/views/GamePage.vue";
import AdminPage from "@/views/AdminPage.vue";
import IndexPage from "@/views/IndexPage.vue";
import PageNotFound from "@/views/PageNotFound.vue";

const routes = [
    { name: 'Home', path: "/", component: IndexPage },
    { name: 'Game', path: "/game/:gameId([^/]+)", component: GamePage },
    { name: 'Play', path: "/game/:gameId([^/]+)/:playerId([^/]+)", component: GamePage },
    { name: 'Admin', path: "/admin", component: AdminPage },


    // Fallback 404 page
    { name: '404', path: "/:notFound(.*)", component: PageNotFound },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;