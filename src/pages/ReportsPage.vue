<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ApiError } from "../services/http";
import { useReportStore } from "../stores/report";
import { useAuthStore } from "../stores/auth";
import type { ReportDirection } from "../types/report";

const auth = useAuthStore();
const reportStore = useReportStore();
const router = useRouter();

const loading = ref(true);
const errorText = ref("");

const reportMeta: Array<{ direction: ReportDirection; title: string }> = [
  { direction: "employment", title: "就业报告" },
  { direction: "postgraduate", title: "升学报告" },
  { direction: "civil_service", title: "公考报告" }
];

const items = computed(() =>
  reportMeta.map((meta) => ({
    ...meta,
    exists: Boolean(reportStore.state.reports[meta.direction])
  }))
);

onMounted(async () => {
  loading.value = true;
  errorText.value = "";

  try {
    await reportStore.ensureLoaded(auth.state.user?.userId ?? "");
  } catch (error) {
    if (error instanceof ApiError) {
      errorText.value = `报告加载失败：${error.message}`;
    } else {
      errorText.value = "报告加载失败，请稍后重试。";
    }
  } finally {
    loading.value = false;
  }
});

const openDetail = async (direction: ReportDirection) => {
  await router.push(`/reports/${direction}`);
};
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow">
    <h1 class="text-xl font-bold text-slate-900">我的报告</h1>
    <p class="mt-2 text-sm text-slate-600">可查看就业/升学/公考三份报告。</p>

    <p v-if="loading" class="mt-5 text-sm text-slate-500">加载中...</p>
    <p v-else-if="errorText" class="mt-5 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">{{ errorText }}</p>

    <ul v-else class="mt-6 space-y-3">
      <li v-for="item in items" :key="item.direction" class="rounded-xl border border-slate-200 p-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-sm font-semibold text-slate-900">{{ item.title }}</p>
            <p class="mt-1 text-xs text-slate-500">状态：{{ item.exists ? "已生成" : "未生成" }}</p>
          </div>

          <button
            class="rounded-lg bg-brand-500 px-3 py-1.5 text-sm text-white disabled:opacity-40"
            :disabled="!item.exists"
            @click="openDetail(item.direction)"
          >
            查看详情
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>
