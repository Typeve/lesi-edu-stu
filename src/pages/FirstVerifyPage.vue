<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ApiError } from "../services/http";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const auth = useAuthStore();

const form = reactive({
  name: "",
  credentialNo: "",
  schoolName: "",
  majorName: ""
});

const loading = ref(false);
const success = ref(false);
const errorText = ref("");

const onSubmit = async () => {
  loading.value = true;
  errorText.value = "";

  try {
    await auth.firstLoginVerify({ ...form });
    success.value = true;
    setTimeout(() => {
      router.replace("/reports");
    }, 800);
  } catch (error) {
    if (error instanceof ApiError) {
      errorText.value = error.message;
    } else {
      errorText.value = "校验失败，请稍后重试";
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <section class="surface p-5 sm:p-6">
    <div class="grid gap-5 lg:grid-cols-[1fr_1.05fr] lg:items-start">
      <article>
        <h1 class="section-title">首次登录校验</h1>
        <p class="section-subtitle">请与招生档案保持一致，系统将据此解锁你的学生身份。</p>

        <div class="mt-5 grid gap-3">
          <div class="surface-soft p-4">
            <p class="text-xs text-slate-500">校验用途</p>
            <p class="mt-1 text-sm text-slate-800">用于绑定学生身份，防止报告与任务数据串号。</p>
          </div>
          <div class="surface-soft p-4">
            <p class="text-xs text-slate-500">完成后</p>
            <p class="mt-1 text-sm text-slate-800">可访问报告、任务中心及榜样案例模块。</p>
          </div>
        </div>
      </article>

      <form class="surface-soft p-4 sm:p-5" @submit.prevent="onSubmit">
        <div class="grid gap-4 md:grid-cols-2">
          <label class="block md:col-span-1">
            <span class="field-label">姓名</span>
            <input v-model="form.name" class="input-field" required placeholder="与招生档案一致" />
          </label>

          <label class="block md:col-span-1">
            <span class="field-label">证件号</span>
            <input v-model="form.credentialNo" class="input-field" required placeholder="请输入证件号" />
          </label>

          <label class="block md:col-span-1">
            <span class="field-label">院校</span>
            <input v-model="form.schoolName" class="input-field" required placeholder="例如：XX大学" />
          </label>

          <label class="block md:col-span-1">
            <span class="field-label">专业</span>
            <input v-model="form.majorName" class="input-field" required placeholder="例如：计算机科学与技术" />
          </label>
        </div>

        <p v-if="errorText" class="state-error mt-4">{{ errorText }}</p>
        <p v-if="success" class="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          校验成功，正在跳转到报告页...
        </p>

        <button type="submit" class="btn-primary mt-4 w-full" :disabled="loading">
          {{ loading ? "提交中..." : "提交并完成校验" }}
        </button>
      </form>
    </div>
  </section>
</template>
