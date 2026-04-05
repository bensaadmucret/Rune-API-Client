<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAppStore } from '../../stores/app';
import { useHistoryStore } from '../../stores/history';
import { useRequestStore } from '../../stores/request';
import CreateCollectionModal from '../modals/CreateCollectionModal.vue';
import CreateFolderModal from '../modals/CreateFolderModal.vue';
import CreateEnvironmentModal from '../modals/CreateEnvironmentModal.vue';
import EnvironmentVariables from './EnvironmentVariables.vue';
import LanguageSelector from './LanguageSelector.vue';
import type { HttpRequest } from '../../types';

const { t } = useI18n();
const appStore = useAppStore();
const historyStore = useHistoryStore();
const requestStore = useRequestStore();

const showCreateCollection = ref(false);
const showCreateFolder = ref(false);
const showCreateEnvironment = ref(false);
const selectedCollectionId = ref('');
const expandedCollections = ref<Set<string>>(new Set());
const expandedFolders = ref<Set<string>>(new Set());

function toggleCollection(collectionId: string) {
  if (expandedCollections.value.has(collectionId)) {
    expandedCollections.value.delete(collectionId);
  } else {
    expandedCollections.value.add(collectionId);
  }
}

function toggleFolder(folderId: string) {
  if (expandedFolders.value.has(folderId)) {
    expandedFolders.value.delete(folderId);
  } else {
    expandedFolders.value.add(folderId);
  }
}

function openCreateFolder(collectionId: string) {
  selectedCollectionId.value = collectionId;
  showCreateFolder.value = true;
}

function loadRequest(request: HttpRequest) {
  requestStore.loadRequest(request);
}

function loadHistoryEntry(entryId: string) {
  const entry = historyStore.getHistoryById(entryId);
  if (entry) {
    requestStore.loadRequest(entry.request);
    requestStore.currentResponse = entry.response;
    appStore.openDetailsPanel();
  }
}

function deleteHistoryEntry(event: Event, entryId: string) {
  event.stopPropagation();
  historyStore.removeFromHistory(entryId);
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return (
    date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }) +
    '.' +
    String(date.getMilliseconds()).padStart(3, '0')
  );
}
</script>

<template>
  <aside class="w-64 bg-white border-r border-[#e5e7eb] flex flex-col h-full">
    <!-- Tabs -->
    <div class="flex border-b border-[#e5e7eb]">
      <button
        :class="[
          'flex-1 py-3 text-sm font-medium transition-colors',
          appStore.sidebarActiveTab === 'collections'
            ? 'text-[#3b82f6] border-b-2 border-[#3b82f6]'
            : 'text-[#6b7280] hover:text-[#374151]',
        ]"
        @click="appStore.setSidebarTab('collections')"
      >
        {{ t('sidebar.collections') }}
      </button>
      <button
        :class="[
          'flex-1 py-3 text-sm font-medium transition-colors',
          appStore.sidebarActiveTab === 'history'
            ? 'text-[#3b82f6] border-b-2 border-[#3b82f6]'
            : 'text-[#6b7280] hover:text-[#374151]',
        ]"
        @click="appStore.setSidebarTab('history')"
      >
        {{ t('sidebar.history') }}
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- Collections Tab -->
      <div v-if="appStore.sidebarActiveTab === 'collections'">
        <!-- Collections Section -->
        <div class="mb-6">
          <div class="mb-3 space-y-2">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
              {{ t('sidebar.collections') }}
            </h3>
            <button
              class="flex w-full items-center justify-center gap-1 whitespace-nowrap rounded-md bg-[#3b82f6] px-2 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-[#2563eb]"
              @click="showCreateCollection = true"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {{ t('sidebar.newCollection') }}
            </button>
          </div>

          <div
            v-if="appStore.collections.length === 0"
            class="text-center py-4 bg-[#f9fafb] rounded-lg"
          >
            <p class="text-sm text-[#6b7280]">
              {{ t('sidebar.noCollections') }}
            </p>
            <p class="text-xs text-[#9ca3af] mt-1">
              {{ t('sidebar.noCollectionsHint') }}
            </p>
          </div>

          <div v-else class="space-y-1">
            <!-- Collection Tree -->
            <div v-for="collection in appStore.collections" :key="collection.id" class="rounded-lg">
              <!-- Collection Header -->
              <div
                class="flex items-center gap-1 p-2 hover:bg-[#f9fafb] rounded-lg cursor-pointer group"
                @click="toggleCollection(collection.id)"
              >
                <svg
                  :class="[
                    'w-4 h-4 text-[#6b7280] transition-transform',
                    expandedCollections.has(collection.id) ? 'rotate-90' : '',
                  ]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <div
                  class="w-3 h-3 rounded-full"
                  :style="{ backgroundColor: collection.color || '#3b82f6' }"
                />
                <span class="text-sm font-medium text-[#374151] flex-1 truncate">{{
                  collection.name
                }}</span>
                <button
                  class="opacity-0 group-hover:opacity-100 p-1 text-[#6b7280] hover:text-[#3b82f6] hover:bg-[#eff6ff] rounded transition-all"
                  :title="t('common.newFolder')"
                  @click.stop="openCreateFolder(collection.id)"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
                <button
                  class="opacity-0 group-hover:opacity-100 p-1 text-[#6b7280] hover:text-[#ef4444] hover:bg-[#fef2f2] rounded transition-all"
                  :title="t('common.deleteCollection')"
                  @click.stop="appStore.removeCollection(collection.id)"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <!-- Collection Content -->
              <div v-if="expandedCollections.has(collection.id)" class="ml-4 mt-1 space-y-1">
                <!-- Folders -->
                <div v-for="folder in collection.folders" :key="folder.id" class="rounded-lg">
                  <div
                    class="flex items-center gap-1 p-2 hover:bg-[#f9fafb] rounded-lg cursor-pointer group"
                    @click="toggleFolder(folder.id)"
                  >
                    <svg
                      :class="[
                        'w-4 h-4 text-[#6b7280] transition-transform',
                        expandedFolders.has(folder.id) ? 'rotate-90' : '',
                      ]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <svg
                      class="w-4 h-4 text-[#f59e0b]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      />
                    </svg>
                    <span class="text-sm text-[#374151] flex-1 truncate">{{ folder.name }}</span>
                    <button
                      class="opacity-0 group-hover:opacity-100 p-1 text-[#6b7280] hover:text-[#ef4444] hover:bg-[#fef2f2] rounded transition-all"
                      :title="t('common.deleteFolder')"
                      @click.stop="appStore.removeFolder(collection.id, folder.id)"
                    >
                      <svg
                        class="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <!-- Folder Requests -->
                  <div v-if="expandedFolders.has(folder.id)" class="ml-4 mt-1 space-y-1">
                    <div
                      v-for="request in folder.requests"
                      :key="request.id"
                      class="flex items-center gap-2 p-2 hover:bg-[#f9fafb] rounded-lg cursor-pointer"
                      @click="loadRequest(request)"
                    >
                      <span
                        class="px-1.5 py-0.5 text-white text-[10px] rounded font-medium uppercase"
                        :class="{
                          'bg-[#3b82f6]': request.method === 'GET',
                          'bg-[#22c55e]': request.method === 'POST',
                          'bg-[#f59e0b]': request.method === 'PUT',
                          'bg-[#ef4444]': request.method === 'DELETE',
                          'bg-[#a855f7]': request.method === 'PATCH',
                        }"
                      >
                        {{ request.method }}
                      </span>
                      <span class="text-sm text-[#374151] truncate">{{
                        request.name || request.url
                      }}</span>
                    </div>
                  </div>
                </div>

                <!-- Root Requests -->
                <div
                  v-for="request in collection.requests"
                  :key="request.id"
                  class="flex items-center gap-2 p-2 hover:bg-[#f9fafb] rounded-lg cursor-pointer"
                  @click="loadRequest(request)"
                >
                  <span
                    class="px-1.5 py-0.5 text-white text-[10px] rounded font-medium uppercase"
                    :class="{
                      'bg-[#3b82f6]': request.method === 'GET',
                      'bg-[#22c55e]': request.method === 'POST',
                      'bg-[#f59e0b]': request.method === 'PUT',
                      'bg-[#ef4444]': request.method === 'DELETE',
                      'bg-[#a855f7]': request.method === 'PATCH',
                    }"
                  >
                    {{ request.method }}
                  </span>
                  <span class="text-sm text-[#374151] truncate">{{
                    request.name || request.url
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Environment Section -->
        <div class="border-t border-[#e5e7eb] pt-4">
          <div class="mb-3 space-y-2">
            <h3 class="text-xs font-semibold text-[#6b7280] uppercase tracking-wide">
              {{ t('common.manageEnvironments') }}
            </h3>
            <button
              class="flex w-full items-center justify-center gap-1 whitespace-nowrap rounded-md border border-[#99f6e4] bg-[#f0fdfa] px-2 py-1.5 text-xs font-medium text-[#0f766e] transition-colors hover:bg-[#ccfbf1]"
              @click="showCreateEnvironment = true"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {{ t('sidebar.newEnvironment') }}
            </button>
          </div>

          <div
            v-if="appStore.environments.length === 0"
            class="text-center py-4 bg-[#f9fafb] rounded-lg"
          >
            <p class="text-sm text-[#6b7280]">
              {{ t('sidebar.noEnvironment') }}
            </p>
          </div>

          <div v-else>
            <select
              v-model="appStore.activeEnvironmentId"
              class="w-full px-3 py-2 border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6] mb-3"
            >
              <option v-for="env in appStore.environments" :key="env.id" :value="env.id">
                {{ env.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- History Tab -->
      <div v-else>
        <div v-if="historyStore.history.length === 0" class="mt-8 text-center">
          <p class="text-sm text-[#6b7280]">
            {{ t('sidebar.noHistory') }}
          </p>
          <p class="text-xs text-[#9ca3af] mt-1">
            {{ t('sidebar.noHistoryHint') }}
          </p>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="entry in historyStore.history"
            :key="entry.id"
            class="p-3 rounded-lg hover:bg-[#f9fafb] cursor-pointer group border border-transparent hover:border-[#e5e7eb] relative"
            @click="loadHistoryEntry(entry.id)"
          >
            <div class="flex items-center gap-2">
              <span
                class="px-1.5 py-0.5 text-white text-xs rounded font-medium uppercase"
                :class="{
                  'bg-[#3b82f6]': entry.request.method === 'GET',
                  'bg-[#22c55e]': entry.request.method === 'POST',
                  'bg-[#f59e0b]': entry.request.method === 'PUT',
                  'bg-[#ef4444]': entry.request.method === 'DELETE',
                  'bg-[#a855f7]': entry.request.method === 'PATCH',
                }"
              >
                {{ entry.request.method }}
              </span>
              <span class="text-sm text-[#374151] truncate">{{
                entry.request.name || entry.request.url
              }}</span>
              <button
                class="opacity-0 group-hover:opacity-100 ml-auto p-1 text-[#6b7280] hover:text-[#ef4444] hover:bg-[#fef2f2] rounded transition-all"
                title="t('common.deleteFromHistory')"
                @click="deleteHistoryEntry($event, entry.id)"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs text-[#6b7280]">{{ formatTime(entry.executedAt) }}</span>
              <span
                class="text-xs"
                :class="{
                  'text-[#22c55e]':
                    entry.response && entry.response.status >= 200 && entry.response.status < 300,
                  'text-[#ef4444]':
                    entry.response &&
                    (entry.response.status >= 400 || entry.response.status >= 500),
                  'text-[#f59e0b]':
                    entry.response && entry.response.status >= 300 && entry.response.status < 400,
                }"
              >
                {{ entry.response?.status || t('common.error') }}
                {{ entry.response?.statusText || '' }}
              </span>
            </div>
          </div>

          <button
            class="w-full mt-4 py-2 text-sm text-[#6b7280] hover:text-[#ef4444] hover:bg-[#fef2f2] rounded-lg transition-colors border border-dashed border-[#e5e7eb] hover:border-[#ef4444]"
            @click="historyStore.clearHistory()"
          >
            {{ t('common.clearHistory') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Environment Variables & Language Footer -->
    <div class="p-3 border-t border-[#e5e7eb] bg-white space-y-2">
      <EnvironmentVariables />
      <LanguageSelector />
    </div>

    <!-- Modals -->
    <CreateCollectionModal :show="showCreateCollection" @close="showCreateCollection = false" />
    <CreateFolderModal
      :show="showCreateFolder"
      :collection-id="selectedCollectionId"
      @close="showCreateFolder = false"
    />
    <CreateEnvironmentModal :show="showCreateEnvironment" @close="showCreateEnvironment = false" />
  </aside>
</template>
