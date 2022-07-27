import { createWebHistory, createRouter } from "vue-router";

import GamePage from "@/views/GamePage.vue";
import AdminPage from "@/views/AdminPage.vue";
import IndexPage from "@/views/IndexPage.vue";
import PageNotFound from "@/views/PageNotFound.vue";

const routes = [
    { path: "/", component: IndexPage },
    { path: "/game/:gameId([^/]+)", component: GamePage },
    { path: "/game/:gameId([^/]+)/:playerId([^/]+)", component: GamePage },
    { path: "/admin", component: AdminPage },


    // Fallback 404 page
    { path: "/:notFound(.*)", component: PageNotFound },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;