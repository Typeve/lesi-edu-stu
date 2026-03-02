<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { ApiError } from "../services/http";
import { submitTaskCheckIn, uploadCertificate } from "../services/task";
import { useAuthStore } from "../stores/auth";
import type { TaskDirection, TaskItem, TaskStatus } from "../types/task";

const auth = useAuthStore();

const filters = reactive<{
  semester: string;
  direction: "all" | TaskDirection;
  status: "all" | TaskStatus;
}>({
  semester: "all",
  direction: "all",
  status: "all"
});

const tasks = ref<TaskItem[]>([
  {
    id: 1,
    title: "完善个人简历",
    semester: "2025-2026-2",
    direction: "employment",
    status: "pending",
    description: "上传简历并完成一次导师点评。"
  },
  {
    id: 2,
    title: "完成升学院校调研",
    semester: "2025-2026-2",
    direction: "postgraduate",
    status: "pending",
    description: "提交3所目标院校的专业与复试要求。"
  },
  {
    id: 3,
    title: "公考岗位信息卡",
    semester: "2025-2026-1",
    direction: "civil_service",
    status: "completed",
    description: "整理目标岗位并形成报名清单。"
  }
]);

const selected = ref<TaskItem | null>(null);
const modalVisible = ref(false);
const modalTask = ref<TaskItem | null>(null);
const uploadFile = ref<File | null>(null);
const note = ref("");
const submitting = ref(false);
const feedback = ref("");

const filteredTasks = computed(() =>
  tasks.value.filter((task) => {
    if (filters.semester !== "all" && task.semester !== filters.semester) return false;
    if (filters.direction !== "all" && task.direction !== filters.direction) return false;
    if (filters.status !== "all" && task.status !== filters.status) return false;
    return true;
  })
);

const openDetail = (task: TaskItem) => {
  selected.value = task;
};

const openCheckInModal = (task: TaskItem) => {
  modalTask.value = task;
  modalVisible.value = true;
  feedback.value = "";
  note.value = "";
  uploadFile.value = null;
};

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  uploadFile.value = input.files?.[0] ?? null;
};

const submit = async () => {
  if (!auth.state.token || !modalTask.value || !uploadFile.value) {
    feedback.value = "请先选择附件。";
    return;
  }

  submitting.value = true;
  feedback.value = "";

  try {
    const upload = await uploadCertificate(auth.state.token, uploadFile.value);
    await submitTaskCheckIn(auth.state.token, modalTask.value.id, {
      fileId: upload.fileId,
      note: note.value
    });

    tasks.value = tasks.value.map((task) =>
      task.id === modalTask.value?.id
        ? {
            ...task,
            status: "completed"
          }
        : task
    );
    feedback.value = "打卡提交成功，列表状态已更新。";
  } catch (error) {
    feedback.value = error instanceof ApiError ? error.message : "打卡失败，请稍后重试。";
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow">
    <h1 class="text-xl font-bold text-slate-900">任务中心</h1>
    <p class="mt-2 text-sm text-slate-600">支持按学期/方向/状态筛选，查看详情并提交打卡。</p>

    <div class="mt-4 grid gap-2 md:grid-cols-3">
      <select v-model="filters.semester" class="rounded-lg border border-slate-300 px-3 py-2 text-sm">
        <option value="all">全部学期</option>
        <option value="2025-2026-1">2025-2026-1</option>
        <option value="2025-2026-2">2025-2026-2</option>
      </select>
      <select v-model="filters.direction" class="rounded-lg border border-slate-300 px-3 py-2 text-sm">
        <option value="all">全部方向</option>
        <option value="employment">就业</option>
        <option value="postgraduate">升学</option>
        <option value="civil_service">公考</option>
      </select>
      <select v-model="filters.status" class="rounded-lg border border-slate-300 px-3 py-2 text-sm">
        <option value="all">全部状态</option>
        <option value="pending">待完成</option>
        <option value="completed">已完成</option>
      </select>
    </div>

    <div class="mt-6 grid gap-4 md:grid-cols-[1.2fr_1fr]">
      <ul class="space-y-3">
        <li v-for="task in filteredTasks" :key="task.id" class="rounded-xl border border-slate-200 p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-semibold text-slate-900">{{ task.title }}</p>
              <p class="mt-1 text-xs text-slate-500">{{ task.semester }} · {{ task.direction }}</p>
            </div>
            <span class="rounded-full px-2 py-0.5 text-xs" :class="task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">
              {{ task.status === "completed" ? "已完成" : "待完成" }}
            </span>
          </div>
          <div class="mt-3 flex gap-2">
            <button class="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-700" @click="openDetail(task)">详情</button>
            <button class="rounded-lg bg-brand-500 px-3 py-1.5 text-xs text-white disabled:opacity-40" :disabled="task.status === 'completed'" @click="openCheckInModal(task)">打卡</button>
          </div>
        </li>
      </ul>

      <aside class="rounded-xl border border-slate-200 p-4" v-if="selected">
        <h2 class="text-sm font-semibold text-slate-900">任务详情</h2>
        <p class="mt-2 text-sm text-slate-700">{{ selected.description }}</p>
      </aside>
    </div>
  </section>

  <div v-if="modalVisible && modalTask" class="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
    <div class="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
      <h3 class="text-lg font-semibold text-slate-900">任务打卡：{{ modalTask.title }}</h3>
      <p class="mt-2 text-xs text-slate-500">请上传附件并填写说明。</p>

      <div class="mt-4 space-y-3">
        <input type="file" @change="onFileChange" class="block w-full text-sm" />
        <textarea v-model="note" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" rows="3" placeholder="打卡说明"></textarea>
      </div>

      <p v-if="feedback" class="mt-3 text-sm" :class="feedback.includes('成功') ? 'text-emerald-600' : 'text-rose-600'">{{ feedback }}</p>

      <div class="mt-5 flex justify-end gap-2">
        <button class="rounded-lg bg-slate-100 px-3 py-1.5 text-sm" @click="modalVisible = false">关闭</button>
        <button class="rounded-lg bg-brand-500 px-3 py-1.5 text-sm text-white disabled:opacity-50" :disabled="submitting" @click="submit">
          {{ submitting ? "提交中..." : "提交打卡" }}
        </button>
      </div>
    </div>
  </div>
</template>
