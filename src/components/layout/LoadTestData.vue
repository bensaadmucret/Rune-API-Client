<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useAppStore } from '../../stores/app';
import { useHistoryStore } from '../../stores/history';
import testData from '../../../test-data.json';

const { t } = useI18n();
const appStore = useAppStore();
const historyStore = useHistoryStore();

function loadTestData() {
  appStore.loadTestData({
    collections: testData.collections as any,
    environments: testData.environments as any,
  });
  historyStore.loadTestHistory(testData.history as any);
}
</script>

<template>
  <button
    class="flex items-center gap-2 px-3 py-2 text-xs text-[#6b7280] hover:text-[#3b82f6] hover:bg-[#eff6ff] rounded-lg transition-colors w-full border border-dashed border-[#e5e7eb] hover:border-[#3b82f6]"
    @click="loadTestData"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
    {{ t('common.loadTestData') }}
  </button>
</template>
