<script setup lang="ts">
// 图片上传器（OSS via /admin/common/upload），v-model:url 双向绑定返回的图片地址
import { ref, watch } from 'vue'
import { uploadFile } from '@/api/common'
import { ElMessage } from '@/api/notify'

const props = defineProps<{
  url?: string
  maxSizeMB?: number
}>()
const emit = defineEmits<{ 'update:url': [v: string] }>()

const localUrl = ref<string>(props.url || '')
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref<boolean>(false)
const dragOver = ref<boolean>(false)

watch(() => props.url, (v) => { localUrl.value = v || '' })

function openPicker() {
  fileInput.value?.click()
}

function onPick(e: Event) {
  const t = e.target as HTMLInputElement
  const f = t.files?.[0]
  if (f) doUpload(f)
  t.value = ''
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  dragOver.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) doUpload(f)
}

async function doUpload(file: File) {
  const max = (props.maxSizeMB ?? 5) * 1024 * 1024
  if (file.size > max) {
    ElMessage.warning(`图片过大（>${props.maxSizeMB ?? 5}MB）`)
    return
  }
  if (!/^image\//.test(file.type)) {
    ElMessage.warning('仅支持图片文件')
    return
  }
  uploading.value = true
  try {
    const url = await uploadFile(file)
    localUrl.value = url
    emit('update:url', url)
    ElMessage.success('已上传')
  } catch { /* 已 toast */ }
  finally {
    uploading.value = false
  }
}

function clear() {
  localUrl.value = ''
  emit('update:url', '')
}
</script>

<template>
  <div
    class="up"
    :class="{ 'up--empty': !localUrl, 'up--over': dragOver, 'up--busy': uploading }"
    @click="!uploading && openPicker()"
    @dragover.prevent="dragOver = true"
    @dragleave="dragOver = false"
    @drop="onDrop"
  >
    <input ref="fileInput" type="file" accept="image/*" hidden @change="onPick" />

    <template v-if="localUrl">
      <img :src="localUrl" alt="" class="up__img" />
      <div class="up__mask">
        <span class="up__hint font-mono">更换图片</span>
      </div>
    </template>
    <template v-else>
      <div class="up__placeholder">
        <div class="up__plus font-display">+</div>
        <div class="up__label font-mono">拖入图片 / 点击上传</div>
        <div class="up__sub dateline">JPG · PNG · ≤ {{ props.maxSizeMB ?? 5 }} MB</div>
      </div>
    </template>

    <div v-if="uploading" class="up__loading font-mono">上传中…</div>

    <button v-if="localUrl && !uploading" class="up__x font-mono" @click.stop="clear">×</button>
  </div>
</template>

<style scoped>
.up {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  background: var(--paper-deep);
  border: 1px dashed var(--rule);
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.18s var(--ease), background 0.18s var(--ease);
}
.up:hover { border-color: var(--ink); background: var(--paper-soft); }
.up--over { border-color: var(--signal); background: var(--signal-soft); }
.up--busy { cursor: wait; }

.up__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.up__mask {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(10, 10, 10, 0.5); color: var(--paper);
  opacity: 0; transition: opacity 0.18s var(--ease);
}
.up:hover .up__mask { opacity: 1; }
.up__hint { font-family: var(--font-pix); font-size: 10px; letter-spacing: 0.22em; }

.up__placeholder {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px;
  color: var(--ink-muted);
  text-align: center;
}
.up__plus { font-family: var(--font-display); font-style: italic; font-weight: 300; font-size: 56px; line-height: 1; color: var(--ink-faint); }
.up__label { font-family: var(--font-pix); font-size: 11px; letter-spacing: 0.22em; color: var(--ink); }
.up__sub { font-size: 10px; letter-spacing: 0.18em; }

.up__loading {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255, 255, 255, 0.88);
  color: var(--ink);
  letter-spacing: 0.22em;
  font-size: 11px;
}

.up__x {
  position: absolute; top: 6px; right: 6px;
  width: 24px; height: 24px;
  background: var(--ink); color: var(--paper);
  border: none; font-size: 16px; line-height: 1;
  cursor: pointer;
}
.up__x:hover { background: var(--signal); }
</style>