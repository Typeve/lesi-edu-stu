<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { assessmentApi } from "../services/assessment";
import { ApiError } from "../services/http";
import type { LikertQuestion } from "../types/assessment";

const router = useRouter();

const loading = ref(true);
const submitting = ref(false);
const errorText = ref("");
const questions = ref<LikertQuestion[]>([]);
const answers = ref<Record<number, number>>({});

const scaleLabels = ["非常不符合", "不太符合", "一般", "比较符合", "非常符合"];

const answeredCount = computed(() => Object.keys(answers.value).length);
const completionRate = computed(() => {
  if (!questions.value.length) {
    return 0;
  }
  return Math.round((answeredCount.value / questions.value.length) * 100);
});
const canSubmit = computed(() => answeredCount.value === questions.value.length && questions.value.length > 0);

onMounted(async () => {
  try {
    const result = await assessmentApi.getQuestions();
    questions.value = result.questions;
  } catch (error) {
    errorText.value = error instanceof ApiError ? error.message : "题目加载失败";
  } finally {
    loading.value = false;
  }
});

const onChooseScore = (questionId: number, score: number) => {
  answers.value[questionId] = score;
};

const onSubmit = async () => {
  if (!canSubmit.value) {
    errorText.value = "请先完成全部题目再提交。";
    return;
  }

  submitting.value = true;
  errorText.value = "";

  const payload = questions.value.map((question) => ({
    questionId: question.questionId,
    score: answers.value[question.questionId] ?? 0
  }));

  try {
    await assessmentApi.submitAnswers(payload);
    await router.push("/assessment/result");
  } catch (error) {
    errorText.value = error instanceof ApiError ? error.message : "提交失败";
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <section class="surface p-5 sm:p-6">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="section-title">职业测评答题</h1>
        <p class="section-subtitle">请根据当前真实状态选择 1-5 分，避免只选中间值。</p>
      </div>
      <span class="chip">已完成 {{ answeredCount }} / {{ questions.length }} 题</span>
    </div>

    <div class="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
      <div class="h-full rounded-full bg-brand-600 transition-[width] duration-300" :style="{ width: `${completionRate}%` }"></div>
    </div>

    <p v-if="loading" class="state-loading mt-6">题目加载中...</p>
    <p v-else-if="errorText && !questions.length" class="state-error mt-6">{{ errorText }}</p>

    <form v-else class="mt-6 space-y-4" @submit.prevent="onSubmit">
      <article v-for="question in questions" :key="question.questionId" class="surface-soft p-4">
        <p class="text-sm font-medium leading-6 text-slate-900">{{ question.order }}. {{ question.text }}</p>

        <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-5">
          <button
            v-for="n in 5"
            :key="n"
            type="button"
            class="btn-secondary justify-start px-3 py-2 text-left text-xs"
            :class="answers[question.questionId] === n ? '!border-brand-600 !bg-brand-50 !text-brand-700' : ''"
            @click="onChooseScore(question.questionId, n)"
          >
            <span class="font-semibold">{{ n }} 分</span>
            <span class="text-slate-500">{{ scaleLabels[n - 1] }}</span>
          </button>
        </div>
      </article>

      <p v-if="errorText" class="state-error">{{ errorText }}</p>

      <div class="surface-soft sticky bottom-3 flex flex-wrap items-center justify-between gap-3 p-3">
        <p class="text-sm text-slate-600">完成全部题目后可提交并生成测评结果。</p>
        <button class="btn-primary" :disabled="submitting || !canSubmit">
          {{ submitting ? "提交中..." : "提交测评" }}
        </button>
      </div>
    </form>
  </section>
</template>
