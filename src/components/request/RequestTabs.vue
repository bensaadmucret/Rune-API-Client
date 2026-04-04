<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRequestStore } from '../../stores/request';
import { useHeaderPresetStore, type HttpHeader } from '../../stores/headerPresets';
import HeaderAutocomplete from './HeaderAutocomplete.vue';
import HeaderValueAutocomplete from './HeaderValueAutocomplete.vue';
import HeaderPresetManager from './HeaderPresetManager.vue';

const { t } = useI18n();
const requestStore = useRequestStore();
const headerPresetStore = useHeaderPresetStore();

const activeTab = ref<'headers' | 'body' | 'params' | 'auth'>('headers');
const showPresetManager = ref(false);
const showPresetDropdown = ref(false);

function addHeader() {
  requestStore.addHeader({ key: '', value: '' });
}

function toggleHeader(index: number) {
  const header = requestStore.currentRequest.headers[index];
  if (header) {
    header.enabled = !header.enabled;
    requestStore.setHeaders([...requestStore.currentRequest.headers]);
  }
}

function applyPreset(headers: HttpHeader[]) {
  // Add preset headers to existing headers
  const existingHeaders = requestStore.currentRequest.headers;
  const newHeaders = headers.map(h => ({ ...h, enabled: true }));
  requestStore.setHeaders([...existingHeaders, ...newHeaders]);
  showPresetDropdown.value = false;
}

// Query Params
interface QueryParam {
  key: string;
  value: string;
  enabled: boolean;
}

const queryParams = ref<QueryParam[]>([]);

// Parse query params from URL
function parseQueryParamsFromUrl() {
  const url = requestStore.currentRequest.url;
  try {
    const urlObj = new URL(url);
    const params: QueryParam[] = [];
    urlObj.searchParams.forEach((value, key) => {
      params.push({ key, value, enabled: true });
    });
    queryParams.value = params;
  } catch {
    // Invalid URL, ignore
  }
}

// Watch URL changes to parse query params
watch(() => requestStore.currentRequest.url, parseQueryParamsFromUrl, { immediate: true });

function addQueryParam() {
  queryParams.value.push({ key: '', value: '', enabled: true });
}

function removeQueryParam(index: number) {
  queryParams.value.splice(index, 1);
  updateUrlFromParams();
}

function toggleQueryParam(index: number) {
  const param = queryParams.value[index];
  if (param) {
    param.enabled = !param.enabled;
    updateUrlFromParams();
  }
}

function updateUrlFromParams() {
  const url = requestStore.currentRequest.url;
  try {
    const urlObj = new URL(url);
    urlObj.search = '';
    queryParams.value.forEach(param => {
      if (param.enabled && param.key) {
        urlObj.searchParams.set(param.key, param.value);
      }
    });
    requestStore.setUrl(urlObj.toString());
  } catch {
    // Invalid URL, ignore
  }
}

// Authentication
const authType = ref<'none' | 'bearer' | 'apikey' | 'basic'>('none');
const authTypes: { value: 'none' | 'bearer' | 'apikey' | 'basic'; label: string }[] = [
  { value: 'none', label: 'requestTabs.authTypes.none' },
  { value: 'bearer', label: 'requestTabs.authTypes.bearer' },
  { value: 'apikey', label: 'requestTabs.authTypes.apikey' },
  { value: 'basic', label: 'requestTabs.authTypes.basic' },
];

const authConfig = ref({
  token: '',
  keyName: 'X-API-Key',
  keyValue: '',
  keyLocation: 'header' as 'header' | 'query',
  username: '',
  password: '',
});

function applyBearerAuth() {
  const token = authConfig.value.token.trim();
  if (!token) return;
  
  // Remove existing Authorization header
  const headers = requestStore.currentRequest.headers.filter(
    h => h.key.toLowerCase() !== 'authorization'
  );
  
  // Add new Authorization header
  headers.unshift({
    key: 'Authorization',
    value: `Bearer ${token}`,
    enabled: true,
  });
  
  requestStore.setHeaders(headers);
  activeTab.value = 'headers';
}

function applyApiKeyAuth() {
  const { keyName, keyValue, keyLocation } = authConfig.value;
  if (!keyName || !keyValue) return;
  
  if (keyLocation === 'header') {
    // Add as header
    const headers = requestStore.currentRequest.headers.filter(
      h => h.key.toLowerCase() !== keyName.toLowerCase()
    );
    headers.unshift({
      key: keyName,
      value: keyValue,
      enabled: true,
    });
    requestStore.setHeaders(headers);
    activeTab.value = 'headers';
  } else {
    // Add as query param
    const existingParam = queryParams.value.find(p => p.key === keyName);
    if (existingParam) {
      existingParam.value = keyValue;
      existingParam.enabled = true;
    } else {
      queryParams.value.push({ key: keyName, value: keyValue, enabled: true });
    }
    updateUrlFromParams();
    activeTab.value = 'params';
  }
}

function applyBasicAuth() {
  const { username, password } = authConfig.value;
  if (!username && !password) return;
  
  // Remove existing Authorization header
  const headers = requestStore.currentRequest.headers.filter(
    h => h.key.toLowerCase() !== 'authorization'
  );
  
  // Create base64 encoded credentials
  const credentials = btoa(`${username}:${password}`);
  
  // Add new Authorization header
  headers.unshift({
    key: 'Authorization',
    value: `Basic ${credentials}`,
    enabled: true,
  });
  
  requestStore.setHeaders(headers);
  activeTab.value = 'headers';
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Tabs with Icons -->
    <div class="flex border-b border-[#e5e7eb] px-2 bg-[#fafafa]">
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
        {{ t('request.headers') }}
        <span
          v-if="requestStore.headersCount > 0"
          class="ml-0.5 px-1.5 py-0 bg-[#3b82f6] text-white text-[10px] rounded-full font-semibold"
        >
          {{ requestStore.headersCount }}
        </span>
      </button>
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
        {{ t('request.body') }}
      </button>
      <button
        :class="[
          'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors relative border-b-2 -mb-[2px]',
          activeTab === 'params'
            ? 'text-[#3b82f6] border-[#3b82f6]'
            : 'text-[#6b7280] border-transparent hover:text-[#374151]'
        ]"
        @click="activeTab = 'params'"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        {{ t('request.params') }}
      </button>
      <button
        :class="[
          'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors relative border-b-2 -mb-[2px]',
          activeTab === 'auth'
            ? 'text-[#3b82f6] border-[#3b82f6]'
            : 'text-[#6b7280] border-transparent hover:text-[#374151]'
        ]"
        @click="activeTab = 'auth'"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        {{ t('request.auth') }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="flex-1 p-4 overflow-y-auto">
      <!-- Headers Tab -->
      <div v-if="activeTab === 'headers'" class="space-y-2">
        <!-- Header Presets Bar -->
        <div class="flex items-center gap-2 mb-3">
          <div class="relative">
            <button
              class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#374151] rounded-md transition-colors"
              @click="showPresetDropdown = !showPresetDropdown"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {{ t('requestTabs.presets') || 'Presets' }}
              <svg
                :class="['w-4 h-4 transition-transform', showPresetDropdown ? 'rotate-180' : '']"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Preset Dropdown -->
            <div
              v-if="showPresetDropdown && headerPresetStore.allPresets.length > 0"
              class="absolute top-full left-0 mt-1 w-56 bg-white border border-[#e5e7eb] rounded-md shadow-lg z-50"
            >
              <div v-if="headerPresetStore.builtinPresets.length > 0" class="py-1">
                <div class="px-3 py-1 text-xs font-medium text-[#6b7280] uppercase">
                  {{ t('requestTabs.builtIn') || 'Built-in' }}
                </div>
                <button
                  v-for="preset in headerPresetStore.builtinPresets"
                  :key="preset.id"
                  class="w-full px-3 py-2 text-sm text-left text-[#374151] hover:bg-[#f3f4f6] transition-colors"
                  @click="applyPreset(preset.headers)"
                >
                  <div class="font-medium">{{ preset.name }}</div>
                  <div class="text-xs text-[#9ca3af]">{{ preset.headers.length }} headers</div>
                </button>
              </div>
              <div v-if="headerPresetStore.customPresets.length > 0" class="border-t border-[#e5e7eb] py-1">
                <div class="px-3 py-1 text-xs font-medium text-[#6b7280] uppercase">
                  {{ t('requestTabs.custom') || 'Custom' }}
                </div>
                <button
                  v-for="preset in headerPresetStore.customPresets"
                  :key="preset.id"
                  class="w-full px-3 py-2 text-sm text-left text-[#374151] hover:bg-[#f3f4f6] transition-colors"
                  @click="applyPreset(preset.headers)"
                >
                  <div class="font-medium">{{ preset.name }}</div>
                  <div class="text-xs text-[#9ca3af]">{{ preset.headers.length }} headers</div>
                </button>
              </div>
            </div>
            <div
              v-else-if="showPresetDropdown"
              class="absolute top-full left-0 mt-1 w-56 bg-white border border-[#e5e7eb] rounded-md shadow-lg z-50 p-4 text-center"
            >
              <p class="text-sm text-[#6b7280]">{{ t('requestTabs.noPresets') || 'No presets yet' }}</p>
            </div>
          </div>

          <button
            class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#3b82f6] hover:bg-[#eff6ff] rounded-md transition-colors"
            @click="showPresetManager = true"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ t('requestTabs.managePresets') || 'Manage Presets' }}
          </button>
        </div>

        <!-- Header Rows -->
        <div
          v-for="(header, index) in requestStore.currentRequest.headers"
          :key="index"
          class="flex items-center gap-2"
        >
          <button
            :class="[
              'w-5 h-5 rounded border flex items-center justify-center transition-colors',
              header.enabled
                ? 'bg-[#3b82f6] border-[#3b82f6]'
                : 'bg-white border-[#d1d5db]'
            ]"
            @click="toggleHeader(index)"
          >
            <svg v-if="header.enabled" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <HeaderAutocomplete
            v-model="header.key"
            placeholder="Header"
            @select="(suggestion) => {
              // When header is selected, focus on value if empty
              if (!header.value && suggestion.commonValues?.length) {
                header.value = suggestion.commonValues[0];
              }
            }"
          />
          <HeaderValueAutocomplete
            v-model="header.value"
            :header-key="header.key"
            placeholder="Value"
          />
          <button
            class="p-1.5 text-[#6b7280] hover:text-[#ef4444] hover:bg-[#fef2f2] rounded-md transition-colors"
            @click="requestStore.removeHeader(index)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <button
          class="flex items-center gap-2 px-4 py-2 text-sm text-[#3b82f6] hover:bg-[#eff6ff] rounded-md transition-colors"
          @click="addHeader"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ t('requestTabs.addHeader') }}
        </button>
      </div>

      <!-- Body Tab -->
      <div v-else-if="activeTab === 'body'" class="space-y-4">
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-2">
            <input
              v-model="requestStore.currentRequest.bodyType"
              type="radio"
              value="none"
              class="text-[#3b82f6]"
            />
            <span class="text-sm text-[#374151]">{{ t('request.none') }}</span>
          </label>
          <label class="flex items-center gap-2">
            <input
              v-model="requestStore.currentRequest.bodyType"
              type="radio"
              value="raw"
              class="text-[#3b82f6]"
            />
            <span class="text-sm text-[#374151]">{{ t('request.raw') }}</span>
          </label>
          <label class="flex items-center gap-2">
            <input
              v-model="requestStore.currentRequest.bodyType"
              type="radio"
              value="formData"
              class="text-[#3b82f6]"
            />
            <span class="text-sm text-[#374151]">{{ t('request.formData') }}</span>
          </label>
          <label class="flex items-center gap-2">
            <input
              v-model="requestStore.currentRequest.bodyType"
              type="radio"
              value="urlEncoded"
              class="text-[#3b82f6]"
            />
            <span class="text-sm text-[#374151]">{{ t('request.urlEncoded') }}</span>
          </label>
        </div>

        <div v-if="requestStore.currentRequest.bodyType === 'raw'" class="space-y-2">
          <select
            v-model="requestStore.currentRequest.rawContentType"
            class="px-3 py-1.5 border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
          >
            <option value="application/json">JSON</option>
            <option value="application/xml">XML</option>
            <option value="text/plain">Text</option>
            <option value="text/html">HTML</option>
          </select>

          <textarea
            v-model="requestStore.currentRequest.body"
            rows="10"
            placeholder='{"key": "value"}'
            class="w-full px-3 py-2 border border-[#e5e7eb] rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#3b82f6] resize-none"
          />
        </div>
      </div>

      <!-- Params Tab -->
      <div v-else-if="activeTab === 'params'" class="h-full flex flex-col">
        <div class="flex items-center justify-between px-4 py-2 border-b border-[#e5e7eb] bg-[#fafafa]">
          <span class="text-xs text-[#6b7280]">{{ t('requestTabs.queryParams') }}</span>
          <button
            class="flex items-center gap-1 px-2 py-1 text-xs text-[#3b82f6] hover:bg-[#eff6ff] rounded transition-colors"
            @click="addQueryParam"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ t('requestTabs.addParam') }}
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-2">
          <div v-if="queryParams.length === 0" class="text-center py-8 text-[#9ca3af]">
            <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p class="text-sm">{{ t('requestTabs.queryParamsHint') }}</p>
            <p class="text-xs mt-1">{{ t('requestTabs.queryParamsManual') }}</p>
          </div>
          <div
            v-for="(param, index) in queryParams"
            :key="index"
            class="flex items-center gap-2"
          >
            <button
              :class="[
                'w-5 h-5 rounded border flex items-center justify-center transition-colors',
                param.enabled
                  ? 'bg-[#3b82f6] border-[#3b82f6]'
                  : 'bg-white border-[#d1d5db]'
              ]"
              @click="toggleQueryParam(index)"
            >
              <svg v-if="param.enabled" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <input
              v-model="param.key"
              type="text"
              placeholder="Key"
              class="flex-1 px-3 py-1.5 border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              @input="updateUrlFromParams"
            />
            <input
              v-model="param.value"
              type="text"
              placeholder="Value"
              class="flex-1 px-3 py-1.5 border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              @input="updateUrlFromParams"
            />
            <button
              class="p-1.5 text-[#6b7280] hover:text-[#ef4444] hover:bg-[#fef2f2] rounded-md transition-colors"
              @click="removeQueryParam(index)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Auth Tab -->
      <div v-else-if="activeTab === 'auth'" class="h-full flex flex-col">
        <div class="p-4 space-y-4">
          <!-- Auth Type Selector -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="type in authTypes"
              :key="type.value"
              :class="[
                'px-3 py-1.5 text-sm font-medium rounded-md border transition-colors',
                authType === type.value
                  ? 'bg-[#3b82f6] text-white border-[#3b82f6]'
                  : 'bg-white text-[#374151] border-[#e5e7eb] hover:border-[#3b82f6]'
              ]"
              @click="authType = type.value"
            >
              {{ t(type.label) }}
            </button>
          </div>

          <!-- No Auth -->
          <div v-if="authType === 'none'" class="text-center py-8 text-[#9ca3af]">
            <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
            <p class="text-sm">{{ t('requestTabs.noAuth') }}</p>
          </div>

          <!-- Bearer Token -->
          <div v-else-if="authType === 'bearer'" class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-[#374151] mb-1">{{ t('requestTabs.token') }}</label>
              <input
                v-model="authConfig.token"
                type="text"
                :placeholder="t('requestTabs.tokenPlaceholder')"
                class="w-full px-3 py-2 border border-[#e5e7eb] rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              />
            </div>
            <button
              class="px-4 py-2 bg-[#3b82f6] text-white text-sm font-medium rounded-md hover:bg-[#2563eb] transition-colors"
              @click="applyBearerAuth"
            >
              {{ t('requestTabs.applyToHeaders') }}
            </button>
          </div>

          <!-- API Key -->
          <div v-else-if="authType === 'apikey'" class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-[#374151] mb-1">{{ t('requestTabs.keyName') }}</label>
              <input
                v-model="authConfig.keyName"
                type="text"
                :placeholder="t('requestTabs.keyPlaceholder')"
                class="w-full px-3 py-2 border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#374151] mb-1">{{ t('requestTabs.keyValue') }}</label>
              <input
                v-model="authConfig.keyValue"
                type="text"
                :placeholder="t('requestTabs.keyValuePlaceholder')"
                class="w-full px-3 py-2 border border-[#e5e7eb] rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              />
            </div>
            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2">
                <input
                  v-model="authConfig.keyLocation"
                  type="radio"
                  value="header"
                  class="text-[#3b82f6]"
                />
                <span class="text-sm text-[#374151]">{{ t('requestTabs.header') }}</span>
              </label>
              <label class="flex items-center gap-2">
                <input
                  v-model="authConfig.keyLocation"
                  type="radio"
                  value="query"
                  class="text-[#3b82f6]"
                />
                <span class="text-sm text-[#374151]">{{ t('requestTabs.queryParam') }}</span>
              </label>
            </div>
            <button
              class="px-4 py-2 bg-[#3b82f6] text-white text-sm font-medium rounded-md hover:bg-[#2563eb] transition-colors"
              @click="applyApiKeyAuth"
            >
              {{ t('requestTabs.apply') }}
            </button>
          </div>

          <!-- Basic Auth -->
          <div v-else-if="authType === 'basic'" class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-[#374151] mb-1">{{ t('requestTabs.username') }}</label>
              <input
                v-model="authConfig.username"
                type="text"
                :placeholder="t('requestTabs.username')"
                class="w-full px-3 py-2 border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#374151] mb-1">{{ t('requestTabs.password') }}</label>
              <input
                v-model="authConfig.password"
                type="password"
                :placeholder="t('requestTabs.password')"
                class="w-full px-3 py-2 border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              />
            </div>
            <button
              class="px-4 py-2 bg-[#3b82f6] text-white text-sm font-medium rounded-md hover:bg-[#2563eb] transition-colors"
              @click="applyBasicAuth"
            >
              {{ t('requestTabs.applyToHeaders') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Header Preset Manager Modal -->
    <HeaderPresetManager
      v-model="showPresetManager"
      @apply="applyPreset"
    />
  </div>
</template>
