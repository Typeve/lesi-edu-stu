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
  <section class="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow">
    <h1 class="text-xl font-bold text-slate-900">首次登录校验</h1>
    <p class="mt-2 text-sm text-slate-600">请按招生档案填写以下信息完成身份校验。</p>

    <form class="mt-6 grid gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
      <label class="block text-sm md:col-span-1">
        <span class="mb-1 block text-slate-700">姓名</span>
        <input v-model="form.name" class="w-full rounded-lg border border-slate-300 px-3 py-2" required />
      </label>
      <label class="block text-sm md:col-span-1">
        <span class="mb-1 block text-slate-700">证件号</span>
        <input v-model="form.credentialNo" class="w-full rounded-lg border border-slate-300 px-3 py-2" required />
      </label>
      <label class="block text-sm md:col-span-1">
        <span class="mb-1 block text-slate-700">院校</span>
        <input v-model="form.schoolName" class="w-full rounded-lg border border-slate-300 px-3 py-2" required />
      </label>
      <label class="block text-sm md:col-span-1">
        <span class="mb-1 block text-slate-700">专业</span>
        <input v-model="form.majorName" class="w-full rounded-lg border border-slate-300 px-3 py-2" required />
      </label>

      <p v-if="errorText" class="text-sm text-rose-600 md:col-span-2">{{ errorText }}</p>
      <p v-if="success" class="text-sm text-emerald-600 md:col-span-2">校验成功，正在跳转...</p>

      <button
        type="submit"
        class="md:col-span-2 rounded-lg bg-brand-500 px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="loading"
      >
        {{ loading ? "提交中..." : "提交校验" }}
      </button>
    </form>
  </section>
</template>
