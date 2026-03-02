<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ApiError } from "../services/http";
import { profileApi } from "../services/profile";
import { useAuthStore } from "../stores/auth";
import type { EnrollmentProfile } from "../types/profile";

const auth = useAuthStore();
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
  if (!auth.state.token) {
    loading.value = false;
    return;
  }

  try {
    const result = await profileApi.getEnrollmentProfile(auth.state.token);
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
  <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow">
    <h1 class="text-xl font-bold text-slate-900">我的画像</h1>
    <p class="mt-2 text-sm text-slate-600">展示招生档案关键字段，仅供查看（只读）。</p>

    <p v-if="loading" class="mt-6 text-sm text-slate-500">加载中...</p>
    <p v-else-if="errorText" class="mt-6 text-sm text-rose-600">{{ errorText }}</p>

    <template v-else>
      <div class="mt-6 grid gap-3 md:grid-cols-2">
        <article class="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p class="text-xs text-slate-500">总分</p>
          <p class="mt-1 text-2xl font-bold text-slate-900">{{ profile?.score ?? "--" }}</p>
        </article>
        <article class="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p class="text-xs text-slate-500">科类/专业</p>
          <p class="mt-1 text-lg font-semibold text-slate-900">{{ profile?.majorName ?? "--" }}</p>
        </article>
      </div>

      <div class="mt-5 flex flex-wrap gap-2">
        <span
          v-for="tag in tags"
          :key="tag"
          class="rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs text-brand-700"
        >
          {{ tag }}
        </span>
      </div>

      <dl class="mt-6 grid gap-3 md:grid-cols-2">
        <div class="rounded-xl border border-slate-200 p-3">
          <dt class="text-xs text-slate-500">学号</dt>
          <dd class="mt-1 text-sm font-medium text-slate-900">{{ profile?.studentNo ?? "--" }}</dd>
        </div>
        <div class="rounded-xl border border-slate-200 p-3">
          <dt class="text-xs text-slate-500">姓名</dt>
          <dd class="mt-1 text-sm font-medium text-slate-900">{{ profile?.name ?? "--" }}</dd>
        </div>
        <div class="rounded-xl border border-slate-200 p-3">
          <dt class="text-xs text-slate-500">院校</dt>
          <dd class="mt-1 text-sm font-medium text-slate-900">{{ profile?.schoolName ?? "--" }}</dd>
        </div>
        <div class="rounded-xl border border-slate-200 p-3">
          <dt class="text-xs text-slate-500">入学年份</dt>
          <dd class="mt-1 text-sm font-medium text-slate-900">{{ profile?.admissionYear ?? "--" }}</dd>
        </div>
      </dl>
    </template>
  </section>
</template>
