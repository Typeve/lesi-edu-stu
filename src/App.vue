<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "./stores/auth";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const onLogout = () => {
  auth.logout();
  router.replace("/login");
};
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
    <header class="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">LESI EDU</p>
          <h1 class="text-lg font-bold text-slate-900">学生端</h1>
        </div>

        <nav class="flex items-center gap-2">
          <RouterLink class="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100" to="/reports">报告</RouterLink>
          <RouterLink class="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100" to="/tasks">任务</RouterLink>
          <button
            v-if="auth.isLoggedIn.value"
            class="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white"
            @click="onLogout"
          >
            退出
          </button>
        </nav>
      </div>

      <p v-if="route.path === '/first-verify'" class="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
        首次校验完成前，报告页与任务页将被拦截。
      </p>
    </header>

    <RouterView />
  </main>
</template>
