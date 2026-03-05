import { createRouter, createWebHistory } from "vue-router";
import FirstVerifyPage from "../pages/FirstVerifyPage.vue";
import LoginPage from "../pages/LoginPage.vue";
import ReportsPage from "../pages/ReportsPage.vue";
import ReportDetailPage from "../pages/ReportDetailPage.vue";
import AssessmentQuestionsPage from "../pages/AssessmentQuestionsPage.vue";
import AssessmentResultPage from "../pages/AssessmentResultPage.vue";
import RoleModelsPage from "../pages/RoleModelsPage.vue";
import ProfilePage from "../pages/ProfilePage.vue";
import TasksPage from "../pages/TasksPage.vue";
import { getDefaultRouteByRole, useAuthStore } from "../stores/auth";
import type { AuthRole } from "../types/auth";

declare module "vue-router" {
  interface RouteMeta {
    requiresAuth?: boolean;
    requiresVerified?: boolean;
    guestOnly?: boolean;
    roles?: AuthRole[];
    permissions?: string[];
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: () => {
        const auth = useAuthStore();
        if (!auth.state.user) {
          return "/login";
        }
        return getDefaultRouteByRole(auth.state.user.role);
      }
    },
    { path: "/login", component: LoginPage, meta: { requiresAuth: false, guestOnly: true } },
    {
      path: "/first-verify",
      component: FirstVerifyPage,
      meta: { requiresAuth: true, roles: ["student"] }
    },
    {
      path: "/profile",
      component: ProfilePage,
      meta: { requiresAuth: true, roles: ["student"], permissions: ["student.profile.read"] }
    },
    {
      path: "/assessment",
      component: AssessmentQuestionsPage,
      meta: {
        requiresAuth: true,
        roles: ["student"],
        permissions: ["student.assessment.submit"]
      }
    },
    {
      path: "/assessment/result",
      component: AssessmentResultPage,
      meta: {
        requiresAuth: true,
        roles: ["student"],
        permissions: ["student.assessment.submit"]
      }
    },
    {
      path: "/role-models",
      component: RoleModelsPage,
      meta: { requiresAuth: true, roles: ["student"] }
    },
    {
      path: "/reports",
      component: ReportsPage,
      meta: { requiresAuth: true, requiresVerified: true, roles: ["student"], permissions: ["report.read"] }
    },
    {
      path: "/reports/:direction",
      component: ReportDetailPage,
      meta: { requiresAuth: true, requiresVerified: true, roles: ["student"], permissions: ["report.read"] }
    },
    {
      path: "/tasks",
      component: TasksPage,
      meta: { requiresAuth: true, requiresVerified: true, roles: ["student"], permissions: ["task.read"] }
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/"
    }
  ]
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (!auth.state.initialized) {
    await auth.initialize();
  }

  if (to.meta.guestOnly && auth.isLoggedIn.value) {
    return getDefaultRouteByRole(auth.state.user!.role);
  }

  const requiresAuth = to.meta.requiresAuth !== false;

  if (requiresAuth && !auth.isLoggedIn.value) {
    return {
      path: "/login",
      query: {
        redirect: to.fullPath
      }
    };
  }

  if (auth.state.user && auth.state.user.role !== "student") {
    await auth.logout();
    return "/login";
  }

  if (to.meta.roles && !auth.hasRole(to.meta.roles)) {
    return "/login";
  }

  if (to.meta.permissions && !auth.hasPermissions(to.meta.permissions)) {
    return "/login";
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
