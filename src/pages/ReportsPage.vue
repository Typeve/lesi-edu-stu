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

const reportMeta: Array<{ direction: ReportDirection; title: string; desc: string }> = [
  { direction: "employment", title: "就业报告", desc: "岗位方向与能力建议" },
  { direction: "postgraduate", title: "升学报告", desc: "院校与备考建议" },
  { direction: "civil_service", title: "公考报告", desc: "岗位匹配与阶段策略" }
];

const getPreview = (content: string): string => {
  if (!content.trim()) {
    return "报告尚未生成。";
  }

  const line = content
    .split("\n")
    .map((value) => value.trim())
    .find((value) => value && !value.startsWith("#") && !value.startsWith("-") && !value.startsWith("*"));

  if (!line) {
    return "报告已生成，点击查看完整内容。";
  }

  return line.length > 56 ? `${line.slice(0, 56)}...` : line;
};

const items = computed(() =>
  reportMeta.map((meta) => {
    const markdown = reportStore.state.reports[meta.direction];
    return {
      ...meta,
      exists: Boolean(markdown),
      preview: getPreview(markdown)
    };
  })
);

const hasAnyReport = computed(() => items.value.some((item) => item.exists));

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

const goAssessment = async () => {
  await router.push("/assessment");
};
</script>

<template>
  <section class="surface p-5 sm:p-6">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="section-title">我的报告</h1>
        <p class="section-subtitle">系统将根据测评与画像生成就业、升学、公考三份报告。</p>
      </div>
      <span class="chip">作业 ID：{{ reportStore.state.jobId ?? "--" }}</span>
    </div>

    <p v-if="loading" class="state-loading mt-6">报告生成中，请稍候...</p>
    <p v-else-if="errorText" class="state-error mt-6">{{ errorText }}</p>
    <p v-else-if="!hasAnyReport" class="state-empty mt-6">
      当前暂无可查看报告。建议先完成测评后再重试。
      <button class="btn-primary mt-3" @click="goAssessment">去做测评</button>
    </p>

    <ul v-else class="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <li v-for="item in items" :key="item.direction" class="surface-soft p-4">
        <p class="text-xs text-slate-500">{{ item.desc }}</p>
        <p class="mt-1 text-base font-semibold tracking-tight text-slate-900">{{ item.title }}</p>
        <p class="mt-2 text-sm leading-6 text-slate-700">{{ item.preview }}</p>

        <div class="mt-4 flex items-center justify-between">
          <span class="chip" :class="item.exists ? '' : 'border-amber-300 bg-amber-50 text-amber-700'">
            {{ item.exists ? "已生成" : "未生成" }}
          </span>
          <button class="btn-primary" :disabled="!item.exists" @click="openDetail(item.direction)">查看详情</button>
        </div>
      </li>
    </ul>
  </section>
</template>
