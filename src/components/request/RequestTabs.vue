<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRequestStore } from '../../stores/request';

const { t } = useI18n();
const requestStore = useRequestStore();

const activeTab = ref<'headers' | 'body' | 'params' | 'auth'>('headers');

const commonHeaders = [
  'Accept',
  'Accept-Encoding',
  'Accept-Language',
  'Authorization',
  'Content-Type',
  'User-Agent',
  'Cache-Control',
];

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
  { value: 'none', label: 'No Auth' },
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'apikey', label: 'API Key' },
  { value: 'basic', label: 'Basic Auth' },
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
          <input
            v-model="header.key"
            type="text"
            list="common-headers"
            placeholder="Header"
            class="flex-1 px-3 py-1.5 border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
          />
          <datalist id="common-headers">
            <option v-for="h in commonHeaders" :key="h" :value="h" />
          </datalist>
          <input
            v-model="header.value"
            type="text"
            placeholder="Value"
            class="flex-1 px-3 py-1.5 border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
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
          Add Header
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
          <span class="text-xs text-[#6b7280]">Query Parameters</span>
          <button
            class="flex items-center gap-1 px-2 py-1 text-xs text-[#3b82f6] hover:bg-[#eff6ff] rounded transition-colors"
            @click="addQueryParam"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Param
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-2">
          <div v-if="queryParams.length === 0" class="text-center py-8 text-[#9ca3af]">
            <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p class="text-sm">Query params will be automatically parsed from URL</p>
            <p class="text-xs mt-1">Or add them manually below</p>
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
              {{ type.label }}
            </button>
          </div>

          <!-- No Auth -->
          <div v-if="authType === 'none'" class="text-center py-8 text-[#9ca3af]">
            <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
            <p class="text-sm">No authentication selected</p>
          </div>

          <!-- Bearer Token -->
          <div v-else-if="authType === 'bearer'" class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-[#374151] mb-1">Token</label>
              <input
                v-model="authConfig.token"
                type="text"
                placeholder="Bearer token"
                class="w-full px-3 py-2 border border-[#e5e7eb] rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              />
            </div>
            <button
              class="px-4 py-2 bg-[#3b82f6] text-white text-sm font-medium rounded-md hover:bg-[#2563eb] transition-colors"
              @click="applyBearerAuth"
            >
              Apply to Headers
            </button>
          </div>

          <!-- API Key -->
          <div v-else-if="authType === 'apikey'" class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-[#374151] mb-1">Key Name</label>
              <input
                v-model="authConfig.keyName"
                type="text"
                placeholder="X-API-Key"
                class="w-full px-3 py-2 border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#374151] mb-1">Key Value</label>
              <input
                v-model="authConfig.keyValue"
                type="text"
                placeholder="Your API key"
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
                <span class="text-sm text-[#374151]">Header</span>
              </label>
              <label class="flex items-center gap-2">
                <input
                  v-model="authConfig.keyLocation"
                  type="radio"
                  value="query"
                  class="text-[#3b82f6]"
                />
                <span class="text-sm text-[#374151]">Query Param</span>
              </label>
            </div>
            <button
              class="px-4 py-2 bg-[#3b82f6] text-white text-sm font-medium rounded-md hover:bg-[#2563eb] transition-colors"
              @click="applyApiKeyAuth"
            >
              Apply
            </button>
          </div>

          <!-- Basic Auth -->
          <div v-else-if="authType === 'basic'" class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-[#374151] mb-1">Username</label>
              <input
                v-model="authConfig.username"
                type="text"
                placeholder="Username"
                class="w-full px-3 py-2 border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#374151] mb-1">Password</label>
              <input
                v-model="authConfig.password"
                type="password"
                placeholder="Password"
                class="w-full px-3 py-2 border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              />
            </div>
            <button
              class="px-4 py-2 bg-[#3b82f6] text-white text-sm font-medium rounded-md hover:bg-[#2563eb] transition-colors"
              @click="applyBasicAuth"
            >
              Apply to Headers
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
