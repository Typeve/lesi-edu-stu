<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ApiError } from "../services/http";
import { getDefaultRouteByRole, useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const form = reactive({
  account: "",
  password: ""
});

const submitting = ref(false);
const errorText = ref("");

const resolveRedirect = (): string => {
  const redirect = route.query.redirect;
  if (typeof redirect === "string" && redirect.startsWith("/")) {
    return redirect;
  }

  if (auth.state.user) {
    return getDefaultRouteByRole(auth.state.user.role);
  }

  return "/reports";
};

const onSubmit = async () => {
  submitting.value = true;
  errorText.value = "";

  try {
    await auth.loginByAccount({
      account: form.account,
      password: form.password
    });

    await router.replace(resolveRedirect());
  } catch (error) {
    if (error instanceof ApiError || error instanceof Error) {
      errorText.value = error.message;
    } else {
      errorText.value = "登录失败，请稍后重试";
    }
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <section class="mx-auto grid min-h-[100dvh] w-full max-w-[1400px] items-center gap-6 px-4 py-6 md:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-8">
    <article class="surface hidden p-8 lg:block">
      <p class="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-500">LESI EDU</p>
      <h1 class="mt-4 text-4xl font-semibold leading-tight tracking-tight text-slate-900">进入学生成长空间</h1>
      <p class="mt-4 max-w-[40ch] text-sm leading-7 text-slate-600">
        在这里完成测评、查看报告、跟进任务打卡。登录后系统会自动恢复你的学习状态与阶段进度。
      </p>

      <div class="mt-10 grid gap-3">
        <div class="surface-soft p-4">
          <p class="text-xs text-slate-500">流程 01</p>
          <p class="mt-1 text-sm font-medium text-slate-900">首次校验</p>
        </div>
        <div class="surface-soft p-4">
          <p class="text-xs text-slate-500">流程 02</p>
          <p class="mt-1 text-sm font-medium text-slate-900">职业测评与榜样匹配</p>
        </div>
        <div class="surface-soft p-4">
          <p class="text-xs text-slate-500">流程 03</p>
          <p class="mt-1 text-sm font-medium text-slate-900">报告阅读与任务闭环</p>
        </div>
      </div>
    </article>

    <article class="surface mx-auto w-full max-w-lg p-5 sm:p-7">
      <h2 class="section-title">学生登录</h2>
      <p class="section-subtitle">请输入学号（账号）和密码登录系统。</p>

      <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
        <label class="block">
          <span class="field-label">学号 / 账号</span>
          <input v-model="form.account" class="input-field" required autocomplete="username" placeholder="例如：2024010001" />
          <p class="field-help">账号通常为学校分配的学号。</p>
        </label>

        <label class="block">
          <span class="field-label">密码</span>
          <input
            v-model="form.password"
            type="password"
            class="input-field"
            required
            autocomplete="current-password"
            placeholder="请输入登录密码"
          />
          <p class="field-help">若为首次登录，请使用学校初始密码后及时修改。</p>
        </label>

        <p v-if="errorText" class="state-error">{{ errorText }}</p>

        <button type="submit" class="btn-primary w-full" :disabled="submitting">
          {{ submitting ? "登录中..." : "登录并继续" }}
        </button>
      </form>
    </article>
  </section>
</template>
