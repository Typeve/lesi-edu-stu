<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ApiError } from "../services/http";
import { profileApi } from "../services/profile";
import type { EnrollmentProfile } from "../types/profile";

const loading = ref(true);
const errorText = ref("");
const profile = ref<EnrollmentProfile | null>(null);

const tags = computed(() => {
  if (!profile.value) {
    return [] as string[];
  }

  const source = profile.value;
  return [
    source.admissionYear ? `${source.admissionYear}级` : null,
    source.majorName ? `专业：${source.majorName}` : null,
    source.schoolName ? `院校：${source.schoolName}` : null,
    source.score !== null ? `总分：${source.score}` : null
  ].filter((item): item is string => !!item);
});

onMounted(async () => {
  try {
    const result = await profileApi.getEnrollmentProfile();
    profile.value = result.profile;
  } catch (error) {
    if (error instanceof ApiError) {
      errorText.value = error.message;
    } else {
      errorText.value = "画像信息加载失败";
    }
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="surface p-5 sm:p-6">
    <h1 class="section-title">我的画像</h1>
    <p class="section-subtitle">展示招生档案关键字段，仅支持查看（只读）。</p>

    <div v-if="loading" class="mt-6 space-y-4">
      <div class="grid gap-3 md:grid-cols-3">
        <div class="h-24 rounded-2xl skeleton"></div>
        <div class="h-24 rounded-2xl skeleton"></div>
        <div class="h-24 rounded-2xl skeleton"></div>
      </div>
      <div class="h-56 rounded-2xl skeleton"></div>
    </div>

    <p v-else-if="errorText" class="state-error mt-6">{{ errorText }}</p>

    <template v-else-if="profile">
      <div class="mt-6 grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr]">
        <article class="surface-soft p-4">
          <p class="kpi-caption">学生姓名</p>
          <p class="kpi-value">{{ profile.name ?? "--" }}</p>
          <p class="mt-2 text-xs text-slate-500">学号：{{ profile.studentNo ?? "--" }}</p>
        </article>

        <article class="surface-soft p-4">
          <p class="kpi-caption">招生总分</p>
          <p class="kpi-value">{{ profile.score ?? "--" }}</p>
          <p class="mt-2 text-xs text-slate-500">用于画像基准</p>
        </article>

        <article class="surface-soft p-4">
          <p class="kpi-caption">入学年份</p>
          <p class="kpi-value">{{ profile.admissionYear ?? "--" }}</p>
          <p class="mt-2 text-xs text-slate-500">当前档案版本</p>
        </article>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <span v-for="tag in tags" :key="tag" class="chip">{{ tag }}</span>
      </div>

      <dl class="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div class="surface-soft p-3.5">
          <dt class="text-xs text-slate-500">院校</dt>
          <dd class="mt-1 text-sm font-medium text-slate-900">{{ profile.schoolName ?? "--" }}</dd>
        </div>
        <div class="surface-soft p-3.5">
          <dt class="text-xs text-slate-500">专业</dt>
          <dd class="mt-1 text-sm font-medium text-slate-900">{{ profile.majorName ?? "--" }}</dd>
        </div>
        <div class="surface-soft p-3.5">
          <dt class="text-xs text-slate-500">学号</dt>
          <dd class="mt-1 text-sm font-medium text-slate-900">{{ profile.studentNo ?? "--" }}</dd>
        </div>
        <div class="surface-soft p-3.5">
          <dt class="text-xs text-slate-500">档案状态</dt>
          <dd class="mt-1 text-sm font-medium text-slate-900">已同步</dd>
        </div>
      </dl>
    </template>

    <p v-else class="state-empty mt-6">暂无画像数据，请联系老师确认招生数据同步状态。</p>
  </section>
</template>
