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

const answeredCount = computed(() => Object.keys(answers.value).length);

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

const onSubmit = async () => {
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
  <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow">
    <h1 class="text-xl font-bold text-slate-900">职业测评答题</h1>
    <p class="mt-2 text-sm text-slate-600">1-5 分量表（非常不符合 → 非常符合）。</p>

    <p v-if="loading" class="mt-5 text-sm text-slate-500">题目加载中...</p>
    <p v-else-if="errorText" class="mt-5 text-sm text-rose-600">{{ errorText }}</p>

    <form v-else class="mt-6 space-y-5" @submit.prevent="onSubmit">
      <article v-for="question in questions" :key="question.questionId" class="rounded-xl border border-slate-200 p-4">
        <p class="text-sm font-medium text-slate-900">{{ question.order }}. {{ question.text }}</p>
        <div class="mt-3 flex gap-2">
          <label v-for="n in 5" :key="n" class="inline-flex items-center gap-1 text-sm text-slate-700">
            <input v-model.number="answers[question.questionId]" type="radio" :name="`q-${question.questionId}`" :value="n" required />
            {{ n }}
          </label>
        </div>
      </article>

      <p class="text-sm text-slate-600">已完成 {{ answeredCount }} / {{ questions.length }} 题</p>
      <p v-if="errorText" class="text-sm text-rose-600">{{ errorText }}</p>

      <button
        class="rounded-lg bg-brand-500 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="submitting"
      >
        {{ submitting ? "提交中..." : "提交测评" }}
      </button>
    </form>
  </section>
</template>
