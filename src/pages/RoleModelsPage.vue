<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ApiError } from "../services/http";
import { roleModelApi } from "../services/role-model";
import type { RoleModelDirection, RoleModelItem } from "../types/role-model";

const tabs: Array<{ key: RoleModelDirection; label: string; desc: string }> = [
  { key: "employment", label: "就业", desc: "企业与岗位案例" },
  { key: "postgraduate", label: "升学", desc: "继续深造案例" },
  { key: "civil_service", label: "公考", desc: "公共服务岗位案例" }
];

const activeDirection = ref<RoleModelDirection>("employment");
const loading = ref(false);
const errorText = ref("");
const models = ref<RoleModelItem[]>([]);
const selected = ref<RoleModelItem | null>(null);

const currentDirectionLabel = computed(() => tabs.find((tab) => tab.key === activeDirection.value)?.label ?? "就业");

const maskedModels = computed(() =>
  models.value.map((item) => ({
    ...item,
    studentNoMasked:
      item.studentNo.length > 4 ? `${item.studentNo.slice(0, 2)}****${item.studentNo.slice(-2)}` : "****"
  }))
);

const load = async (direction: RoleModelDirection) => {
  loading.value = true;
  errorText.value = "";

  try {
    const result = await roleModelApi.list(direction);
    models.value = result.models;
    selected.value = result.models[0] ?? null;
  } catch (error) {
    errorText.value = error instanceof ApiError ? error.message : "榜样案例加载失败";
    models.value = [];
    selected.value = null;
  } finally {
    loading.value = false;
  }
};

const onSwitch = async (direction: RoleModelDirection) => {
  if (direction === activeDirection.value) {
    return;
  }
  activeDirection.value = direction;
  await load(direction);
};

onMounted(async () => {
  await load(activeDirection.value);
});
</script>

<template>
  <section class="surface p-5 sm:p-6">
    <h1 class="section-title">榜样案例</h1>
    <p class="section-subtitle">系统会按你的方向推荐相近样本，学号字段已自动脱敏。</p>

    <div class="mt-5 grid gap-2 sm:grid-cols-3">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="btn-secondary w-full flex-col items-start !gap-0.5 !py-3"
        :class="activeDirection === tab.key ? '!border-brand-600 !bg-brand-50 !text-brand-700' : ''"
        @click="onSwitch(tab.key)"
      >
        <span class="text-sm font-semibold">{{ tab.label }}</span>
        <span class="text-[11px] text-slate-500">{{ tab.desc }}</span>
      </button>
    </div>

    <p v-if="loading" class="state-loading mt-5">正在加载 {{ currentDirectionLabel }} 方向案例...</p>
    <p v-else-if="errorText" class="state-error mt-5">{{ errorText }}</p>
    <p v-else-if="!maskedModels.length" class="state-empty mt-5">当前方向暂无可展示案例，请稍后重试。</p>

    <div v-else class="mt-6 grid gap-4 lg:grid-cols-[1.25fr_1fr]">
      <ul class="space-y-3">
        <li
          v-for="item in maskedModels"
          :key="`${activeDirection}-${item.studentNo}`"
          class="surface-soft cursor-pointer p-4 transition-colors"
          :class="selected?.studentNo === item.studentNo ? '!border-brand-600 !bg-brand-50' : ''"
          @click="selected = item"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-semibold text-slate-900">{{ item.name }}</p>
              <p class="mt-1 text-xs text-slate-500">学号：{{ item.studentNoMasked }}</p>
            </div>
            <span class="chip">差值 {{ item.scoreGap }}</span>
          </div>

          <div class="mt-3 flex flex-wrap gap-1.5">
            <span v-for="tag in item.tags" :key="tag" class="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
              {{ tag }}
            </span>
          </div>
        </li>
      </ul>

      <aside class="surface-soft p-4" v-if="selected">
        <h2 class="text-base font-semibold tracking-tight text-slate-900">案例详情</h2>
        <p class="mt-3 text-sm leading-7 text-slate-700">
          该样本与当前测评方向匹配度较高，可重点关注其行动路径与阶段安排。
        </p>

        <dl class="mt-4 space-y-3 text-sm">
          <div>
            <dt class="text-xs text-slate-500">方向</dt>
            <dd class="mt-1 font-medium text-slate-900">{{ currentDirectionLabel }}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500">对标标签</dt>
            <dd class="mt-1 text-slate-700">{{ selected.tags.join(" / ") || "综合能力匹配" }}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500">建议动作</dt>
            <dd class="mt-1 text-slate-700">将对标标签拆成可执行任务，写入任务中心逐步打卡。</dd>
          </div>
        </dl>
      </aside>
    </div>
  </section>
</template>
