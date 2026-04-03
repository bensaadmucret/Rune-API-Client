<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAppStore } from '../../stores/app';

const { t } = useI18n();
const appStore = useAppStore();

const props = defineProps<{
  show: boolean;
  collectionId: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const name = ref('');
const error = ref('');

function close() {
  name.value = '';
  error.value = '';
  emit('close');
}

function createFolder() {
  if (!name.value.trim()) {
    error.value = t('modal.folderNameRequired');
    return;
  }

  const folder = {
    id: crypto.randomUUID(),
    name: name.value.trim(),
    requests: [],
  };

  appStore.addFolder(props.collectionId, folder);
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
      <div class="bg-white rounded-lg shadow-xl w-[400px] max-w-[90vw]">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
          <h2 class="text-lg font-semibold text-[#111827]">{{ t('modal.newFolder') }}</h2>
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
        <div class="p-6">
          <div>
            <label class="block text-sm font-medium text-[#374151] mb-1">
              {{ t('common.name') }} <span class="text-[#ef4444]">*</span>
            </label>
            <input
              v-model="name"
              type="text"
              :placeholder="t('modal.folderNamePlaceholder')"
              class="w-full px-3 py-2 border border-[#e5e7eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
              @keyup.enter="createFolder"
            />
            <p v-if="error" class="mt-1 text-sm text-[#ef4444]">{{ error }}</p>
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
            @click="createFolder"
          >
            {{ t('modal.createFolder') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
