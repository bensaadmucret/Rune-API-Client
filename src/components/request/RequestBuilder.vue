<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRequestStore } from '../../stores/request';
import { useHistoryStore } from '../../stores/history';
import MethodBadge from '../common/MethodBadge.vue';
import SaveRequestModal from '../modals/SaveRequestModal.vue';

const { t } = useI18n();
const requestStore = useRequestStore();
const historyStore = useHistoryStore();

const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'] as const;
const showMethodDropdown = ref(false);
const showSaveModal = ref(false);

function selectMethod(method: typeof methods[number]) {
  requestStore.setMethod(method);
  showMethodDropdown.value = false;
}

async function sendRequest() {
  const result = await requestStore.executeRequest();
  
  // Add to history if successful
  if (result.success && result.response) {
    historyStore.addToHistory({
      id: crypto.randomUUID(),
      request: result.request,
      response: result.response,
      executedAt: Date.now(),
    });
  }
}
</script>

<template>
  <div class="p-4 border-b border-[#e5e7eb]">
    <div class="flex items-center gap-3">
      <!-- Method Selector -->
      <div class="relative">
        <button
          class="flex items-center gap-2 px-3 py-2 bg-[#f3f4f6] hover:bg-[#e5e7eb] rounded-md transition-colors"
          @click="showMethodDropdown = !showMethodDropdown"
        >
          <MethodBadge :method="requestStore.currentRequest.method" />
          <svg class="w-4 h-4 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Dropdown -->
        <div
          v-if="showMethodDropdown"
          class="absolute top-full left-0 mt-1 w-32 bg-white border border-[#e5e7eb] rounded-md shadow-lg z-10"
        >
          <button
            v-for="method in methods"
            :key="method"
            class="w-full flex items-center px-3 py-2 hover:bg-[#f9fafb] transition-colors"
            @click="selectMethod(method)"
          >
            <MethodBadge :method="method" />
          </button>
        </div>
      </div>

      <!-- URL Input -->
      <div class="flex-1">
        <input
          v-model="requestStore.currentRequest.url"
          type="text"
          placeholder="https://api.example.com/endpoint"
          class="w-full px-3 py-2 bg-white border border-[#e5e7eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent text-sm"
          @keyup.enter="sendRequest"
        />
      </div>

      <!-- Save Button -->
      <button
        class="flex items-center gap-2 px-4 py-2 bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#374151] rounded-md font-medium transition-colors"
        @click="showSaveModal = true"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        {{ t('common.save') }}
      </button>

      <!-- Send Button -->
      <button
        :disabled="requestStore.isLoading"
        class="flex items-center gap-2 px-5 py-2 bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-[#9ca3af] text-white rounded-md font-medium transition-colors"
        @click="sendRequest"
      >
        <svg v-if="requestStore.isLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span v-else>{{ t('common.send') }}</span>
      </button>
    </div>
  </div>

  <!-- Save Request Modal -->
  <SaveRequestModal
    :show="showSaveModal"
    :request="requestStore.currentRequest"
    @close="showSaveModal = false"
  />
</template>
