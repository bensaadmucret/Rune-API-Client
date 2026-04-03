<script setup lang="ts">
import { ref } from 'vue';
import { useAppStore } from '../../stores/app';
import type { HttpRequest } from '../../types';

const props = defineProps<{
  show: boolean;
  request: HttpRequest;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const appStore = useAppStore();

const selectedCollectionId = ref('');
const selectedFolderId = ref('');
const requestName = ref('');
const error = ref('');

function close() {
  selectedCollectionId.value = '';
  selectedFolderId.value = '';
  requestName.value = '';
  error.value = '';
  emit('close');
}

function saveRequest() {
  if (!requestName.value.trim()) {
    error.value = 'Request name is required';
    return;
  }

  if (!selectedCollectionId.value) {
    error.value = 'Please select a collection';
    return;
  }

  const requestToSave = {
    ...props.request,
    id: crypto.randomUUID(),
    name: requestName.value.trim(),
    updatedAt: Date.now(),
  };

  appStore.addRequestToCollection(
    selectedCollectionId.value,
    requestToSave,
    selectedFolderId.value || undefined
  );
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
          <h2 class="text-lg font-semibold text-[#111827]">Save Request</h2>
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
              Request Name <span class="text-[#ef4444]">*</span>
            </label>
            <input
              v-model="requestName"
              type="text"
              :placeholder="request.url || 'My Request'"
              class="w-full px-3 py-2 border border-[#e5e7eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-[#374151] mb-1">
              Collection <span class="text-[#ef4444]">*</span>
            </label>
            <select
              v-model="selectedCollectionId"
              class="w-full px-3 py-2 border border-[#e5e7eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
            >
              <option value="">Select a collection</option>
              <option
                v-for="collection in appStore.collections"
                :key="collection.id"
                :value="collection.id"
              >
                {{ collection.name }}
              </option>
            </select>
          </div>

          <div v-if="selectedCollectionId">
            <label class="block text-sm font-medium text-[#374151] mb-1">Folder (Optional)</label>
            <select
              v-model="selectedFolderId"
              class="w-full px-3 py-2 border border-[#e5e7eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
            >
              <option value="">Root of collection</option>
              <option
                v-for="folder in appStore.collections.find(c => c.id === selectedCollectionId)?.folders"
                :key="folder.id"
                :value="folder.id"
              >
                {{ folder.name }}
              </option>
            </select>
          </div>

          <p v-if="error" class="text-sm text-[#ef4444]">{{ error }}</p>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#e5e7eb] bg-[#f9fafb] rounded-b-lg">
          <button
            class="px-4 py-2 text-sm font-medium text-[#6b7280] hover:text-[#374151] hover:bg-[#f3f4f6] rounded-md transition-colors"
            @click="close"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 text-sm font-medium text-white bg-[#3b82f6] hover:bg-[#2563eb] rounded-md transition-colors"
            @click="saveRequest"
          >
            Save Request
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
