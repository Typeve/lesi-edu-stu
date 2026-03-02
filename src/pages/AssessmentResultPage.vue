<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { assessmentApi } from "../services/assessment";
import { ApiError } from "../services/http";
import { useAuthStore } from "../stores/auth";
import type { AssessmentResultResponse } from "../types/assessment";

const auth = useAuthStore();
const loading = ref(true);
const errorText = ref("");
const result = ref<AssessmentResultResponse | null>(null);

onMounted(async () => {
  if (!auth.state.token) {
    loading.value = false;
    return;
  }

  try {
    result.value = await assessmentApi.getResult(auth.state.token);
  } catch (error) {
    errorText.value = error instanceof ApiError ? error.message : "结果加载失败";
  } finally {
    loading.value = false;
  }
});

const bars = computed(() => {
  if (!result.value) {
    return [] as Array<{ key: string; label: string; value: number }>;
  }

  const scores = result.value.dimensionScores;
  return [
    { key: "self", label: "自我认知", value: scores.selfCognition },
    { key: "plan", label: "职业规划", value: scores.careerPlanning },
    { key: "exec", label: "执行力", value: scores.executionPower }
  ];
});

const nextActionText = computed(() => {
  const direction = result.value?.recommendation.direction;
  if (direction === "postgraduate") return "建议下一步：查看升学方向榜样与报告。";
  if (direction === "civil_service") return "建议下一步：查看公考方向榜样与报告。";
  return "建议下一步：查看就业方向榜样与报告。";
});
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow">
    <h1 class="text-xl font-bold text-slate-900">测评结果</h1>

    <p v-if="loading" class="mt-4 text-sm text-slate-500">结果加载中...</p>
    <p v-else-if="errorText" class="mt-4 text-sm text-rose-600">{{ errorText }}</p>

    <template v-else>
      <div class="mt-5 space-y-3">
        <article v-for="item in bars" :key="item.key">
          <div class="mb-1 flex items-center justify-between text-sm text-slate-700">
            <span>{{ item.label }}</span>
            <span>{{ item.value }}</span>
          </div>
          <div class="h-3 rounded bg-slate-100">
            <div class="h-3 rounded bg-brand-500" :style="{ width: `${item.value}%` }"></div>
          </div>
        </article>
      </div>

      <p class="mt-5 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
        {{ result?.recommendation.summary }}
      </p>

      <p class="mt-3 text-sm font-medium text-brand-700">{{ nextActionText }}</p>
    </template>
  </section>
</template>
