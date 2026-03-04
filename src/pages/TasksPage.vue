<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { ApiError } from "../services/http";
import { submitTaskCheckIn, uploadCertificate } from "../services/task";
import type { TaskDirection, TaskItem, TaskStatus } from "../types/task";

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
    description: "提交 3 所目标院校的专业与复试要求。"
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

const directionLabel: Record<TaskDirection, string> = {
  employment: "就业",
  postgraduate: "升学",
  civil_service: "公考"
};

const statusLabel: Record<TaskStatus, string> = {
  pending: "待完成",
  completed: "已完成"
};

const filteredTasks = computed(() =>
  tasks.value.filter((task) => {
    if (filters.semester !== "all" && task.semester !== filters.semester) return false;
    if (filters.direction !== "all" && task.direction !== filters.direction) return false;
    if (filters.status !== "all" && task.status !== filters.status) return false;
    return true;
  })
);

const pendingCount = computed(() => tasks.value.filter((task) => task.status === "pending").length);
const completedCount = computed(() => tasks.value.filter((task) => task.status === "completed").length);

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

const closeModal = () => {
  modalVisible.value = false;
  modalTask.value = null;
  uploadFile.value = null;
  note.value = "";
  feedback.value = "";
};

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  uploadFile.value = input.files?.[0] ?? null;
};

const submit = async () => {
  if (!modalTask.value || !uploadFile.value) {
    feedback.value = "请先选择附件后再提交。";
    return;
  }

  submitting.value = true;
  feedback.value = "";

  try {
    const upload = await uploadCertificate(uploadFile.value);
    await submitTaskCheckIn(modalTask.value.id, {
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

    feedback.value = "打卡提交成功，状态已更新。";
    if (selected.value && selected.value.id === modalTask.value.id) {
      selected.value = {
        ...selected.value,
        status: "completed"
      };
    }
  } catch (error) {
    feedback.value = error instanceof ApiError ? error.message : "打卡失败，请稍后重试。";
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <section class="surface p-5 sm:p-6">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="section-title">任务中心</h1>
        <p class="section-subtitle">按学期、方向、状态筛选任务，并提交凭证打卡。</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <span class="chip">待完成 {{ pendingCount }}</span>
        <span class="chip">已完成 {{ completedCount }}</span>
      </div>
    </div>

    <div class="mt-4 grid gap-2 md:grid-cols-3">
      <select v-model="filters.semester" class="select-field">
        <option value="all">全部学期</option>
        <option value="2025-2026-1">2025-2026-1</option>
        <option value="2025-2026-2">2025-2026-2</option>
      </select>
      <select v-model="filters.direction" class="select-field">
        <option value="all">全部方向</option>
        <option value="employment">就业</option>
        <option value="postgraduate">升学</option>
        <option value="civil_service">公考</option>
      </select>
      <select v-model="filters.status" class="select-field">
        <option value="all">全部状态</option>
        <option value="pending">待完成</option>
        <option value="completed">已完成</option>
      </select>
    </div>

    <p v-if="!filteredTasks.length" class="state-empty mt-6">暂无符合筛选条件的任务。</p>

    <div v-else class="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <ul class="space-y-3">
        <li v-for="task in filteredTasks" :key="task.id" class="surface-soft p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-semibold text-slate-900">{{ task.title }}</p>
              <p class="mt-1 text-xs text-slate-500">{{ task.semester }} · {{ directionLabel[task.direction] }}</p>
            </div>
            <span
              class="rounded-full border px-2.5 py-1 text-xs"
              :class="task.status === 'completed' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'"
            >
              {{ statusLabel[task.status] }}
            </span>
          </div>

          <div class="mt-3 flex flex-wrap gap-2">
            <button class="btn-secondary" @click="openDetail(task)">查看详情</button>
            <button class="btn-primary" :disabled="task.status === 'completed'" @click="openCheckInModal(task)">
              {{ task.status === "completed" ? "已打卡" : "去打卡" }}
            </button>
          </div>
        </li>
      </ul>

      <aside class="surface-soft p-4" v-if="selected">
        <h2 class="text-base font-semibold tracking-tight text-slate-900">任务详情</h2>
        <p class="mt-2 text-sm leading-7 text-slate-700">{{ selected.description }}</p>

        <dl class="mt-4 space-y-3 text-sm">
          <div>
            <dt class="text-xs text-slate-500">方向</dt>
            <dd class="mt-1 text-slate-900">{{ directionLabel[selected.direction] }}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500">状态</dt>
            <dd class="mt-1 text-slate-900">{{ statusLabel[selected.status] }}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500">建议</dt>
            <dd class="mt-1 text-slate-700">优先完成可量化证据上传，说明尽量写清行动结果。</dd>
          </div>
        </dl>
      </aside>
    </div>
  </section>

  <div v-if="modalVisible && modalTask" class="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 px-4" @click.self="closeModal">
    <div class="surface w-full max-w-lg p-5">
      <h3 class="text-lg font-semibold tracking-tight text-slate-900">任务打卡：{{ modalTask.title }}</h3>
      <p class="section-subtitle">上传附件并补充说明，提交后会更新任务状态。</p>

      <div class="mt-4 space-y-3">
        <div>
          <label class="field-label">附件文件</label>
          <input type="file" class="input-field" @change="onFileChange" />
        </div>

        <div>
          <label class="field-label">打卡说明</label>
          <textarea
            v-model="note"
            class="textarea-field"
            rows="4"
            placeholder="例如：已完成导师点评并依据反馈更新简历"
          ></textarea>
        </div>
      </div>

      <p v-if="feedback" class="mt-3 text-sm" :class="feedback.includes('成功') ? 'text-emerald-700' : 'text-rose-700'">{{ feedback }}</p>

      <div class="mt-5 flex flex-wrap justify-end gap-2">
        <button class="btn-secondary" @click="closeModal">关闭</button>
        <button class="btn-primary" :disabled="submitting" @click="submit">
          {{ submitting ? "提交中..." : "提交打卡" }}
        </button>
      </div>
    </div>
  </div>
</template>
