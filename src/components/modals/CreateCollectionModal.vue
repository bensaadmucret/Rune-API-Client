<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAppStore } from '../../stores/app';

const { t } = useI18n();
const appStore = useAppStore();

defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const name = ref('');
const description = ref('');
const color = ref('#3b82f6');
const error = ref('');

const colors = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7',
  '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
];

function close() {
  name.value = '';
  description.value = '';
  color.value = '#3b82f6';
  error.value = '';
  emit('close');
}

function createCollection() {
  if (!name.value.trim()) {
    error.value = t('modal.collectionNameRequired');
    return;
  }

  const collection = {
    id: crypto.randomUUID(),
    name: name.value.trim(),
    description: description.value.trim(),
    folders: [],
    requests: [],
    color: color.value,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  appStore.addCollection(collection);
  close();
}
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      @click.self="close"
    >
      <div class="bg-white rounded-lg shadow-xl w-[480px] max-w-[90vw]">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
          <h2 class="text-lg font-semibold text-[#111827]">{{ t('modal.newCollection') }}</h2>
          <button
            class="p-1.5 text-[#6b7280] hover:bg-[#f3f4f6] rounded-md transition-colors"
            @click="close"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form -->
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-[#374151] mb-1">
              {{ t('common.name') }} <span class="text-[#ef4444]">*</span>
            </label>
            <input
              v-model="name"
              type="text"
              :placeholder="t('modal.collectionNamePlaceholder')"
              class="w-full px-3 py-2 border border-[#e5e7eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
              @keyup.enter="createCollection"
            />
            <p v-if="error" class="mt-1 text-sm text-[#ef4444]">{{ error }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-[#374151] mb-1">{{ t('common.description') }}</label>
            <textarea
              v-model="description"
              rows="2"
              :placeholder="t('modal.descriptionPlaceholder')"
              class="w-full px-3 py-2 border border-[#e5e7eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-[#374151] mb-2">{{ t('common.color') }}</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="c in colors"
                :key="c"
                :class="[
                  'w-8 h-8 rounded-full transition-transform hover:scale-110',
                  color === c ? 'ring-2 ring-offset-2 ring-[#111827]' : ''
                ]"
                :style="{ backgroundColor: c }"
                @click="color = c"
              />
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#e5e7eb] bg-[#f9fafb] rounded-b-lg">
          <button
            class="px-4 py-2 text-sm font-medium text-[#6b7280] hover:text-[#374151] hover:bg-[#f3f4f6] rounded-md transition-colors"
            @click="close"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            class="px-4 py-2 text-sm font-medium text-white bg-[#3b82f6] hover:bg-[#2563eb] rounded-md transition-colors"
            @click="createCollection"
          >
            {{ t('modal.createCollection') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
