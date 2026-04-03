<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useAppStore } from '../../stores/app';
import { useRequestStore } from '../../stores/request';
import MethodBadge from '../common/MethodBadge.vue';
import StatusBadge from '../common/StatusBadge.vue';
import TagBadge from '../common/TagBadge.vue';
import LinkBadge from '../common/LinkBadge.vue';

const { t } = useI18n();
const appStore = useAppStore();
const requestStore = useRequestStore();

const activeTab = ref<'request' | 'response'>('request');

// Mock data for plugins, metadata, webhooks (as shown in reference image)
const plugins = ['Plugin #2', 'Plugin #3', 'Longer Plugin Name Appears Here'];
const metadata = ['Metadata of a certain length', 'Metadata #2', 'Metadata #3'];
const webhooks = ['Webhook_example_1', 'Webhook_example_that_gets_truncated_when_its_too_long_to_dis...'];
</script>

<script lang="ts">
import { ref } from 'vue';
</script>

<template>
  <Transition
    enter-active-class="transition-transform duration-300 ease-out"
    enter-from-class="translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition-transform duration-300 ease-in"
    leave-from-class="translate-x-0"
    leave-to-class="translate-x-full"
  >
    <div
      v-if="appStore.isDetailsPanelOpen"
      class="fixed right-0 top-0 h-full w-[480px] bg-white shadow-xl border-l border-[#e5e7eb] z-50 flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
        <h2 class="text-xl font-semibold text-[#111827]">Details</h2>
        <div class="flex items-center gap-2">
          <button
            class="flex items-center gap-2 px-3 py-1.5 text-sm text-[#6b7280] hover:bg-[#f3f4f6] rounded-md transition-colors"
            @click="requestStore.executeRequest()"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ t('details.replayRequest') }}
          </button>
          <button
            class="flex items-center gap-2 px-3 py-1.5 text-sm text-[#ef4444] hover:bg-[#fef2f2] rounded-md transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {{ t('details.downloadJson') }}
          </button>
          <button
            class="p-1.5 text-[#6b7280] hover:bg-[#f3f4f6] rounded-md transition-colors"
            @click="appStore.closeDetailsPanel()"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-hidden flex flex-col">
        <!-- Scrollable info sections -->
        <div class="flex-1 overflow-y-auto">
          <!-- Method & Status Row -->
          <div class="grid grid-cols-2 gap-8 px-6 py-4">
            <div>
              <label class="block text-xs text-[#6b7280] uppercase tracking-wide mb-2">
                {{ t('details.requestMethod') }}
              </label>
              <MethodBadge :method="requestStore.currentRequest.method" />
            </div>
            <div>
              <label class="block text-xs text-[#6b7280] uppercase tracking-wide mb-2">
                {{ t('details.requestStatusCode') }}
              </label>
              <StatusBadge :status="requestStore.currentResponse?.status || 200" />
            </div>
          </div>

          <!-- Associated Plugins -->
          <div class="px-6 py-3 bg-[#f9fafb]">
            <label class="block text-sm text-[#374151] font-medium mb-2">
              {{ t('details.associatedPlugins') }}
            </label>
            <div class="flex flex-wrap gap-2">
              <TagBadge v-for="plugin in plugins" :key="plugin" :label="plugin" />
            </div>
          </div>

          <!-- Associated Metadata -->
          <div class="px-6 py-3">
            <label class="block text-sm text-[#374151] font-medium mb-2">
              {{ t('details.associatedMetadata') }}
            </label>
            <div class="flex flex-wrap gap-2">
              <TagBadge v-for="meta in metadata" :key="meta" :label="meta" />
            </div>
          </div>

          <!-- Associated Webhooks -->
          <div class="px-6 py-3 bg-[#f9fafb]">
            <label class="block text-sm text-[#374151] font-medium mb-2">
              {{ t('details.associatedWebhooks') }}
            </label>
            <div class="flex flex-col gap-2">
              <LinkBadge v-for="webhook in webhooks" :key="webhook" :label="webhook" />
            </div>
          </div>

          <!-- URL -->
          <div class="px-6 py-3">
            <label class="block text-xs text-[#6b7280] uppercase tracking-wide mb-2">
              {{ t('details.requestEndpointPath') }}
            </label>
            <div class="text-sm text-[#111827] break-all font-mono">
              https://staging.speakeasyapi.dev/workspaces/self/requests?SE-I%F0%9F%90%9Dstatus=%21%3...
            </div>
          </div>

          <!-- Referrer -->
          <div class="px-6 py-3 bg-[#f9fafb]">
            <label class="block text-xs text-[#6b7280] uppercase tracking-wide mb-2">
              {{ t('details.referrer') }}
            </label>
            <div class="text-sm text-[#111827] break-all font-mono">
              https://staging.speakeasyapi.dev/workspaces/self/requests?SE-I%F0%9F%90%9Dstatus=%21%3...
            </div>
          </div>

          <!-- Tabs -->
          <div class="px-6 py-3 border-t border-[#e5e7eb] sticky top-0 bg-white">
            <div class="flex items-center gap-4">
              <button
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  activeTab === 'request'
                    ? 'bg-[#f3f4f6] text-[#111827]'
                    : 'text-[#6b7280] hover:text-[#374151]'
                ]"
                @click="activeTab = 'request'"
              >
                {{ t('details.request') }}
              </button>
              <button
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  activeTab === 'response'
                    ? 'bg-[#f3f4f6] text-[#111827]'
                    : 'text-[#6b7280] hover:text-[#374151]'
                ]"
                @click="activeTab = 'response'"
              >
                {{ t('details.response') }}
              </button>
            </div>
          </div>

          <!-- Tab Content -->
          <div class="px-6 py-4">
            <div v-if="activeTab === 'request'">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-base font-semibold text-[#111827]">Request Header</h3>
                <button class="flex items-center gap-1 text-sm text-[#6b7280] hover:text-[#374151]">
                  {{ t('details.collapseSection') }}
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <div class="space-y-3">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs text-[#6b7280] uppercase tracking-wide mb-1">Accept</label>
                    <div class="text-sm text-[#111827]">application/json, text/plain, */*</div>
                  </div>
                  <div>
                    <label class="block text-xs text-[#6b7280] uppercase tracking-wide mb-1">Accept-Encoding</label>
                    <div class="text-sm text-[#111827]">gzip, deflate, br</div>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs text-[#6b7280] uppercase tracking-wide mb-1">Accept-Language</label>
                    <div class="text-sm text-[#111827]">en-US,en;q=0.9</div>
                  </div>
                  <div>
                    <label class="block text-xs text-[#6b7280] uppercase tracking-wide mb-1">Authorization</label>
                    <div class="text-sm text-[#111827] font-mono">Bearer eyJhbG...</div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else>
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-base font-semibold text-[#111827]">Response Body</h3>
              </div>
              <pre class="bg-[#f9fafb] p-4 rounded-lg text-sm text-[#111827] overflow-x-auto">{{ JSON.stringify({ message: 'Hello, World!', status: 'ok' }, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
