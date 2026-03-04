<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ApiError } from "../services/http";
import { roleModelApi } from "../services/role-model";
import type { RoleModelDirection, RoleModelItem } from "../types/role-model";

const tabs: Array<{ key: RoleModelDirection; label: string }> = [
  { key: "employment", label: "就业" },
  { key: "postgraduate", label: "升学" },
  { key: "civil_service", label: "公考" }
];

const activeDirection = ref<RoleModelDirection>("employment");
const loading = ref(false);
const errorText = ref("");
const models = ref<RoleModelItem[]>([]);
const selected = ref<RoleModelItem | null>(null);

const maskedModels = computed(() =>
  models.value.map((item) => ({
    ...item,
    studentNoMasked:
      item.studentNo.length > 4
        ? `${item.studentNo.slice(0, 2)}****${item.studentNo.slice(-2)}`
        : "****"
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
  } finally {
    loading.value = false;
  }
};

const onSwitch = async (direction: RoleModelDirection) => {
  activeDirection.value = direction;
  await load(direction);
};

onMounted(async () => {
  await load(activeDirection.value);
});
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow">
    <h1 class="text-xl font-bold text-slate-900">榜样案例</h1>
    <p class="mt-2 text-sm text-slate-600">按方向查看对标案例（列表字段已脱敏）。</p>

    <div class="mt-5 flex gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="rounded-lg px-3 py-1.5 text-sm"
        :class="activeDirection === tab.key ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-700'"
        @click="onSwitch(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <p v-if="loading" class="mt-5 text-sm text-slate-500">加载中...</p>
    <p v-else-if="errorText" class="mt-5 text-sm text-rose-600">{{ errorText }}</p>

    <div v-else class="mt-6 grid gap-4 md:grid-cols-[1.2fr_1fr]">
      <ul class="space-y-3">
        <li
          v-for="item in maskedModels"
          :key="`${activeDirection}-${item.studentNo}`"
          class="cursor-pointer rounded-xl border p-3"
          :class="selected?.studentNo === item.studentNo ? 'border-brand-500 bg-brand-50' : 'border-slate-200'"
          @click="selected = item"
        >
          <p class="text-sm font-semibold text-slate-900">{{ item.name }}</p>
          <p class="mt-1 text-xs text-slate-500">学号：{{ item.studentNoMasked }}</p>
          <p class="mt-1 text-xs text-slate-500">差值：{{ item.scoreGap }}</p>
          <div class="mt-2 flex flex-wrap gap-1">
            <span v-for="tag in item.tags" :key="tag" class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{{ tag }}</span>
          </div>
        </li>
      </ul>

      <aside class="rounded-xl border border-slate-200 p-4" v-if="selected">
        <h2 class="text-sm font-semibold text-slate-900">案例详情</h2>
        <p class="mt-2 text-sm text-slate-700">对标点：{{ selected.tags.join(' / ') || '综合能力匹配' }}</p>
        <p class="mt-2 text-sm text-slate-700">
          毕业去向：
          {{ activeDirection === 'employment' ? '企业就业' : activeDirection === 'postgraduate' ? '继续深造' : '公共服务岗位' }}
        </p>
      </aside>
    </div>
  </section>
</template>
