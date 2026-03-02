import { createRouter, createWebHistory } from "vue-router";
import FirstVerifyPage from "../pages/FirstVerifyPage.vue";
import LoginPage from "../pages/LoginPage.vue";
import ReportsPage from "../pages/ReportsPage.vue";
import TasksPage from "../pages/TasksPage.vue";
import { useAuthStore } from "../stores/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/login" },
    { path: "/login", component: LoginPage },
    { path: "/first-verify", component: FirstVerifyPage, meta: { requiresAuth: true } },
    { path: "/reports", component: ReportsPage, meta: { requiresAuth: true, requiresVerified: true } },
    { path: "/tasks", component: TasksPage, meta: { requiresAuth: true, requiresVerified: true } }
  ]
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isLoggedIn.value) {
    return "/login";
  }

  if (to.path === "/login" && auth.isLoggedIn.value) {
    return auth.requiresFirstVerify.value ? "/first-verify" : "/reports";
  }

  if (to.meta.requiresVerified && auth.requiresFirstVerify.value) {
    return "/first-verify";
  }

  if (to.path === "/first-verify" && auth.isLoggedIn.value && !auth.requiresFirstVerify.value) {
    return "/reports";
  }

  return true;
});

export default router;
