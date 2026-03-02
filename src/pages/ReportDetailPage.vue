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
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow">
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-xl font-bold text-slate-900">{{ title }}</h1>
      <button class="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700" @click="router.push('/reports')">
        返回列表
      </button>
    </div>

    <p v-if="!markdown" class="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">报告内容暂不可用，请返回重试。</p>

    <article
      v-else
      class="prose prose-slate max-w-none prose-table:border prose-table:border-slate-200 prose-th:bg-slate-50"
      v-html="html"
    ></article>
  </section>
</template>
