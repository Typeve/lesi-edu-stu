<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ApiError } from "../services/http";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const router = useRouter();

const form = reactive({
  studentNo: "",
  password: ""
});

const submitting = ref(false);
const errorText = ref("");

const onSubmit = async () => {
  submitting.value = true;
  errorText.value = "";

  try {
    await auth.login({ studentNo: form.studentNo, password: form.password });
    await router.replace("/first-verify");
  } catch (error) {
    if (error instanceof ApiError) {
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
  <section class="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow">
    <h1 class="text-xl font-bold text-slate-900">学生登录</h1>
    <p class="mt-2 text-sm text-slate-600">请输入学号和密码登录系统。</p>

    <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
      <label class="block text-sm">
        <span class="mb-1 block text-slate-700">学号</span>
        <input v-model="form.studentNo" class="w-full rounded-lg border border-slate-300 px-3 py-2" required />
      </label>
      <label class="block text-sm">
        <span class="mb-1 block text-slate-700">密码</span>
        <input v-model="form.password" type="password" class="w-full rounded-lg border border-slate-300 px-3 py-2" required />
      </label>

      <p v-if="errorText" class="text-sm text-rose-600">{{ errorText }}</p>

      <button
        type="submit"
        class="w-full rounded-lg bg-brand-500 px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="submitting"
      >
        {{ submitting ? "登录中..." : "登录" }}
      </button>
    </form>
  </section>
</template>
