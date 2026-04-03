<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRequestStore } from '../../stores/request';
import StatusBadge from '../common/StatusBadge.vue';

const { t } = useI18n();
const requestStore = useRequestStore();

const activeTab = ref<'body' | 'headers' | 'cookies'>('body');
const viewMode = ref<'pretty' | 'raw'>('pretty');

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const formattedBody = computed(() => {
  const body = requestStore.currentResponse?.body || '';
  const contentType = requestStore.currentResponse?.contentType || '';
  
  if (contentType.includes('json')) {
    try {
      const parsed = JSON.parse(body);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return body;
    }
  }
  return body;
});

// JSON Syntax Highlighting
const highlightedLines = computed(() => {
  const lines = formattedBody.value.split('\n');
  return lines.map(line => {
    // Use inline styles for reliable colors on dark background
    let highlighted = line
      .replace(/"([^"]*)"(?=:)/g, '<span style="color: #9cdcfe;">"$1"</span>') // keys - light blue
      .replace(/: "([^"]*)"/g, ': <span style="color: #ce9178;">"$1"</span>') // string values - orange
      .replace(/: (\d+)/g, ': <span style="color: #b5cea8;">$1</span>') // numbers - light green
      .replace(/: (true|false)/g, ': <span style="color: #569cd6;">$1</span>') // booleans - blue
      .replace(/: (null)/g, ': <span style="color: #569cd6;">$1</span>') // null - blue
      .replace(/([{}\[\]])/g, '<span style="color: #ffd700;">$1</span>'); // brackets - gold
    return highlighted || ' '; // Ensure empty lines have content
  });
});

function copyToClipboard() {
  if (requestStore.currentResponse?.body) {
    navigator.clipboard.writeText(requestStore.currentResponse.body);
  }
}

function downloadResponse() {
  if (!requestStore.currentResponse?.body) return;
  
  const blob = new Blob([requestStore.currentResponse.body], { 
    type: requestStore.currentResponse.contentType || 'text/plain' 
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `response-${Date.now()}.${requestStore.currentResponse.contentType.includes('json') ? 'json' : 'txt'}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div v-if="requestStore.currentResponse" class="flex flex-col h-full bg-white">
    <!-- Response Info Bar -->
    <div class="flex items-center gap-6 px-4 py-3 border-b border-[#e5e7eb] bg-[#f9fafb]">
      <div class="flex items-center gap-2">
        <span class="text-xs text-[#6b7280] uppercase tracking-wide">{{ t('response.status') }}</span>
        <StatusBadge :status="requestStore.currentResponse.status" />
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-[#6b7280] uppercase tracking-wide">{{ t('response.time') }}</span>
        <span class="text-sm font-medium text-[#374151]">{{ requestStore.currentResponse.time }}ms</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-[#6b7280] uppercase tracking-wide">{{ t('response.size') }}</span>
        <span class="text-sm font-medium text-[#374151]">{{ formatSize(requestStore.currentResponse.size) }}</span>
      </div>
      <div class="ml-auto flex items-center gap-2">
        <button
          class="p-1.5 text-[#6b7280] hover:text-[#374151] hover:bg-[#e5e7eb] rounded transition-colors"
          title="Copy to clipboard"
          @click="copyToClipboard"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          class="p-1.5 text-[#6b7280] hover:text-[#374151] hover:bg-[#e5e7eb] rounded transition-colors"
          title="Download response"
          @click="downloadResponse"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Tabs with Icons -->
    <div class="flex border-b border-[#e5e7eb] px-2 bg-[#fafafa]">
      <button
        :class="[
          'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors relative border-b-2 -mb-[2px]',
          activeTab === 'body'
            ? 'text-[#3b82f6] border-[#3b82f6]'
            : 'text-[#6b7280] border-transparent hover:text-[#374151]'
        ]"
        @click="activeTab = 'body'"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        {{ t('response.body') }}
      </button>
      <button
        :class="[
          'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors relative border-b-2 -mb-[2px]',
          activeTab === 'headers'
            ? 'text-[#3b82f6] border-[#3b82f6]'
            : 'text-[#6b7280] border-transparent hover:text-[#374151]'
        ]"
        @click="activeTab = 'headers'"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {{ t('response.headers') }}
        <span
          v-if="Object.keys(requestStore.currentResponse.headers).length > 0"
          class="ml-0.5 px-1.5 py-0 bg-[#3b82f6] text-white text-[10px] rounded-full font-semibold"
        >
          {{ Object.keys(requestStore.currentResponse.headers).length }}
        </span>
      </button>
      <button
        :class="[
          'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors relative border-b-2 -mb-[2px]',
          activeTab === 'cookies'
            ? 'text-[#3b82f6] border-[#3b82f6]'
            : 'text-[#6b7280] border-transparent hover:text-[#374151]'
        ]"
        @click="activeTab = 'cookies'"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        {{ t('response.cookies') }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="flex-1 overflow-hidden">
      <!-- Body Tab -->
      <div v-if="activeTab === 'body'" class="h-full flex flex-col">
        <!-- View Mode Toggle -->
        <div class="flex items-center gap-2 px-4 py-2 border-b border-[#e5e7eb] bg-[#fafafa]">
          <button
            :class="[
              'px-3 py-1 text-xs font-medium rounded transition-colors',
              viewMode === 'pretty' ? 'bg-white text-[#374151] shadow-sm border border-[#e5e7eb]' : 'text-[#6b7280] hover:text-[#374151]'
            ]"
            @click="viewMode = 'pretty'"
          >
            Pretty
          </button>
          <button
            :class="[
              'px-3 py-1 text-xs font-medium rounded transition-colors',
              viewMode === 'raw' ? 'bg-white text-[#374151] shadow-sm border border-[#e5e7eb]' : 'text-[#6b7280] hover:text-[#374151]'
            ]"
            @click="viewMode = 'raw'"
          >
            Raw
          </button>
          <span class="ml-auto text-xs text-[#9ca3af]">{{ requestStore.currentResponse.contentType }}</span>
        </div>

        <!-- Code with Line Numbers and Syntax Highlighting -->
        <div class="flex-1 overflow-auto bg-[#1e1e1e]">
          <div class="flex min-h-full">
            <!-- Line Numbers -->
            <div class="flex-shrink-0 py-4 px-3 text-right bg-[#252526] text-[#6e7681] text-sm font-mono select-none">
              <div v-for="n in highlightedLines.length" :key="n" class="leading-5">{{ n }}</div>
            </div>
            <!-- Code -->
            <div class="flex-1 py-4 px-4 overflow-x-auto">
              <pre class="text-sm font-mono leading-5 whitespace-pre" style="color: #d4d4d4;"><div v-for="(line, index) in highlightedLines" :key="index" v-html="line || ' '"/></pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Headers Tab -->
      <div v-else-if="activeTab === 'headers'" class="p-4 overflow-y-auto h-full">
        <div class="border border-[#e5e7eb] rounded-lg overflow-hidden">
          <div
            v-for="(value, key) in requestStore.currentResponse.headers"
            :key="key"
            class="flex border-b border-[#e5e7eb] last:border-b-0"
          >
            <div class="w-1/3 px-4 py-2 bg-[#f9fafb] text-sm font-medium text-[#374151] border-r border-[#e5e7eb]">{{ key }}</div>
            <div class="w-2/3 px-4 py-2 text-sm text-[#6b7280] break-all font-mono bg-white">{{ value }}</div>
          </div>
        </div>
      </div>

      <!-- Cookies Tab -->
      <div v-else-if="activeTab === 'cookies'" class="p-4 h-full">
        <div class="flex flex-col items-center justify-center h-full text-[#6b7280]">
          <svg class="w-12 h-12 mb-3 text-[#d1d5db]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p class="text-sm">No cookies received</p>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="flex items-center justify-center h-full text-[#6b7280]">
    <div class="text-center">
      <svg class="w-12 h-12 mx-auto mb-3 text-[#d1d5db]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p class="text-sm">{{ t('response.empty') }}</p>
    </div>
  </div>
</template>
