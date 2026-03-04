<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "./stores/auth";
import { useReportStore } from "./stores/report";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const reportStore = useReportStore();

const user = computed(() => auth.state.user);
const isAuthShell = computed(() => auth.state.initialized && !!user.value && route.path !== "/login");

const routeMetaMap: Record<string, { title: string; desc: string }> = {
  "/first-verify": { title: "首次身份校验", desc: "请先完成校验，解锁完整功能。" },
  "/profile": { title: "我的画像", desc: "查看招生数据画像与基础标签。" },
  "/assessment": { title: "职业测评", desc: "完成量表答题，获取方向建议。" },
  "/assessment/result": { title: "测评结果", desc: "查看维度得分与下一步建议。" },
  "/role-models": { title: "榜样案例", desc: "按方向查看可参考的同类案例。" },
  "/reports": { title: "我的报告", desc: "就业、升学、公考三份报告入口。" },
  "/tasks": { title: "任务中心", desc: "按学期与状态管理任务打卡。" }
};

const currentMeta = computed(() => {
  if (route.path.startsWith("/reports/")) {
    return { title: "报告详情", desc: "按方向查看完整报告内容。" };
  }
  return routeMetaMap[route.path] ?? { title: "学生端", desc: "LESI EDU" };
});

const navItems = [
  { to: "/profile", title: "画像", desc: "查看招生画像" },
  { to: "/assessment", title: "测评", desc: "完成职业测评" },
  { to: "/role-models", title: "榜样", desc: "参考优秀案例" },
  { to: "/reports", title: "报告", desc: "查看三份报告" },
  { to: "/tasks", title: "任务", desc: "任务与打卡" }
];

const isActiveLink = (to: string) => {
  if (to === "/reports") {
    return route.path === "/reports" || route.path.startsWith("/reports/");
  }
  if (to === "/assessment") {
    return route.path === "/assessment" || route.path.startsWith("/assessment/");
  }
  return route.path === to;
};

const onLogout = async () => {
  await auth.logout();
  reportStore.reset();
  await router.replace("/login");
};
</script>

<template>
  <main class="min-h-[100dvh]">
    <div v-if="!auth.state.initialized" class="mx-auto flex min-h-[100dvh] w-full max-w-[1400px] items-center justify-center px-4">
      <div class="surface w-full max-w-md p-6 text-center">
        <div class="mx-auto h-10 w-36 rounded-xl skeleton"></div>
        <p class="mt-4 text-sm text-slate-600">正在恢复登录态，请稍候...</p>
      </div>
    </div>

    <RouterView v-else-if="!isAuthShell" />

    <div v-else class="mx-auto grid w-full max-w-[1400px] gap-4 px-4 py-4 md:gap-5 md:px-5 md:py-5 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-6">
      <aside class="surface h-fit p-4 md:p-5 lg:sticky lg:top-5">
        <div class="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
          <p class="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-slate-500">LESI EDU</p>
          <h1 class="mt-2 text-xl font-semibold tracking-tight text-slate-900">学生成长中心</h1>
          <p class="mt-2 text-sm text-slate-600">{{ user?.displayName }}（{{ user?.account }}）</p>
        </div>

        <nav class="mt-4 space-y-2">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="nav-link"
            :class="isActiveLink(item.to) ? 'nav-link-active' : ''"
          >
            <div>
              <p class="nav-link-title">{{ item.title }}</p>
              <p class="nav-link-desc">{{ item.desc }}</p>
            </div>
            <span class="text-xs text-slate-400">›</span>
          </RouterLink>
        </nav>

        <button class="btn-secondary mt-4 w-full" @click="onLogout">退出登录</button>
      </aside>

      <section class="space-y-4 md:space-y-5">
        <header class="surface p-4 md:p-5">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-[0.7rem] font-medium uppercase tracking-[0.15em] text-slate-500">当前页面</p>
              <h2 class="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{{ currentMeta.title }}</h2>
              <p class="mt-1 text-sm text-slate-600">{{ currentMeta.desc }}</p>
            </div>
            <span class="chip">角色：student</span>
          </div>

          <p v-if="route.path === '/first-verify'" class="state-empty mt-4">
            完成首次校验后，可访问测评、报告、任务等完整能力。
          </p>
        </header>

        <RouterView />
      </section>
    </div>
  </main>
</template>
