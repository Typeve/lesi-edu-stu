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

const onLogout = async () => {
  await auth.logout();
  reportStore.reset();
  await router.replace("/login");
};
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
    <header v-if="auth.state.initialized && user" class="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">LESI EDU</p>
          <h1 class="text-lg font-bold text-slate-900">学生端</h1>
          <p class="mt-1 text-xs text-slate-500">{{ user.displayName }}（{{ user.account }}）</p>
        </div>

        <nav class="flex items-center gap-2">
          <RouterLink class="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100" to="/profile">画像</RouterLink>
          <RouterLink class="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100" to="/assessment">测评</RouterLink>
          <RouterLink class="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100" to="/role-models">榜样</RouterLink>
          <RouterLink class="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100" to="/reports">报告</RouterLink>
          <RouterLink class="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100" to="/tasks">任务</RouterLink>
          <button class="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white" @click="onLogout">退出</button>
        </nav>
      </div>

      <p v-if="route.path === '/first-verify'" class="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
        首次校验完成前，报告页与任务页将被拦截。
      </p>
    </header>

    <p v-if="!auth.state.initialized" class="mt-16 text-center text-sm text-slate-500">正在恢复登录态...</p>
    <RouterView v-else />
  </main>
</template>
