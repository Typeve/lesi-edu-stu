<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { assessmentApi } from "../services/assessment";
import { ApiError } from "../services/http";
import type { AssessmentResultResponse } from "../types/assessment";

const router = useRouter();

const loading = ref(true);
const errorText = ref("");
const result = ref<AssessmentResultResponse | null>(null);

onMounted(async () => {
  try {
    result.value = await assessmentApi.getResult();
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
  if (direction === "postgraduate") return "建议下一步：优先查看升学方向榜样和报告。";
  if (direction === "civil_service") return "建议下一步：优先查看公考方向榜样和报告。";
  return "建议下一步：优先查看就业方向榜样和报告。";
});

const jumpToNext = async () => {
  const direction = result.value?.recommendation.direction;
  if (!direction) {
    await router.push("/reports");
    return;
  }

  await router.push(`/reports/${direction}`);
};
</script>

<template>
  <section class="surface p-5 sm:p-6">
    <h1 class="section-title">测评结果</h1>
    <p class="section-subtitle">以下维度基于你的最新答题结果自动计算。</p>

    <p v-if="loading" class="state-loading mt-6">结果加载中...</p>
    <p v-else-if="errorText" class="state-error mt-6">{{ errorText }}</p>

    <template v-else-if="result">
      <div class="mt-6 grid gap-3 md:grid-cols-3">
        <article v-for="item in bars" :key="item.key" class="surface-soft p-4">
          <p class="text-xs text-slate-500">{{ item.label }}</p>
          <p class="kpi-value">{{ item.value }}</p>
          <div class="mt-3 h-2 rounded-full bg-slate-100">
            <div class="h-2 rounded-full bg-brand-600 transition-[width] duration-300" :style="{ width: `${item.value}%` }"></div>
          </div>
        </article>
      </div>

      <article class="surface-soft mt-4 p-4">
        <p class="text-sm font-medium text-slate-900">方向建议</p>
        <p class="mt-2 text-sm leading-7 text-slate-700">{{ result.recommendation.summary }}</p>
        <p class="mt-3 text-sm font-semibold text-brand-700">{{ nextActionText }}</p>
      </article>

      <div class="mt-4 flex flex-wrap gap-2">
        <button class="btn-primary" @click="jumpToNext">查看推荐报告</button>
        <button class="btn-secondary" @click="router.push('/role-models')">查看榜样案例</button>
      </div>
    </template>

    <p v-else class="state-empty mt-6">暂无测评结果，请先完成测评答题。</p>
  </section>
</template>
