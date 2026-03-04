<script setup lang="ts">
import MarkdownIt from "markdown-it";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useReportStore } from "../stores/report";
import type { ReportDirection } from "../types/report";

const route = useRoute();
const router = useRouter();
const reportStore = useReportStore();
const md = new MarkdownIt({ html: false, linkify: true, breaks: true });

const direction = computed(() => route.params.direction as ReportDirection);
const markdown = computed(() => reportStore.state.reports[direction.value] || "");
const html = computed(() => md.render(markdown.value));

const title = computed(() => {
  if (direction.value === "postgraduate") return "升学报告";
  if (direction.value === "civil_service") return "公考报告";
  return "就业报告";
});

const directionDesc = computed(() => {
  if (direction.value === "postgraduate") return "关注院校层次、专业匹配与备考安排。";
  if (direction.value === "civil_service") return "关注岗位竞争比、阶段复习与岗位筛选。";
  return "关注目标行业、岗位能力与求职节奏。";
});
</script>

<template>
  <section class="surface p-5 sm:p-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="section-title">{{ title }}</h1>
        <p class="section-subtitle">{{ directionDesc }}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button class="btn-secondary" @click="router.push('/reports')">返回报告列表</button>
        <button class="btn-ghost" @click="router.push('/tasks')">去任务中心</button>
      </div>
    </div>

    <p v-if="!markdown" class="state-empty mt-6">报告内容暂不可用，请返回列表后重试。</p>

    <article v-else class="report-markdown mt-6 rounded-2xl border border-slate-200/70 bg-white px-4 py-5 sm:px-5" v-html="html"></article>
  </section>
</template>
