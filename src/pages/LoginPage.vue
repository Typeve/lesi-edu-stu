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
  <section class="login-shell">
    <article class="login-hero">
      <div class="login-orb login-orb-primary"></div>
      <div class="login-orb login-orb-secondary"></div>

      <div class="login-hero-top">
        <p class="login-kicker">Student Growth Portal</p>
        <h1 class="login-title">内蒙古师范大学</h1>
        <p class="login-subtitle">学生成长发展平台</p>
        <p class="login-copy">
          统一承接身份校验、职业测评、榜样参考、报告阅读与任务跟进，帮助学生持续完成成长路径中的每一步。
        </p>
      </div>

      <div class="login-metric-grid">
        <div class="login-metric-card">
          <p class="login-metric-label">统一入口</p>
          <p class="login-metric-value">登录后自动恢复学习进度</p>
        </div>
        <div class="login-metric-card">
          <p class="login-metric-label">成长流程</p>
          <p class="login-metric-value">校验、测评、报告、任务闭环</p>
        </div>
        <div class="login-metric-card">
          <p class="login-metric-label">状态同步</p>
          <p class="login-metric-value">按账号识别并进入当前阶段</p>
        </div>
      </div>

      <div class="login-flow">
        <div class="login-flow-item">
          <span class="login-flow-index">01</span>
          <div>
            <p class="login-flow-title">首次校验</p>
            <p class="login-flow-copy">确认基础身份信息，解锁完整功能。</p>
          </div>
        </div>
        <div class="login-flow-item">
          <span class="login-flow-index">02</span>
          <div>
            <p class="login-flow-title">职业测评</p>
            <p class="login-flow-copy">完成测评并匹配适合的方向与榜样案例。</p>
          </div>
        </div>
        <div class="login-flow-item">
          <span class="login-flow-index">03</span>
          <div>
            <p class="login-flow-title">报告与任务</p>
            <p class="login-flow-copy">查看结果报告并跟进阶段任务打卡。</p>
          </div>
        </div>
      </div>
    </article>

    <article class="login-panel">
      <div class="login-panel-badge">学生登录</div>
      <h2 class="login-panel-title">欢迎进入学生空间</h2>
      <p class="login-panel-copy">请输入学号（账号）和密码登录系统，平台将自动恢复你的当前学习阶段。</p>

      <form class="login-form" @submit.prevent="onSubmit">
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

      <div class="login-panel-footer">
        <p class="login-panel-note">登录后可继续完成测评、查看报告，并根据系统进度进入后续任务模块。</p>
      </div>
    </article>
  </section>
</template>
