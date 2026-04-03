import { ref } from 'vue';
import { defineStore } from 'pinia';
import { invoke } from '@tauri-apps/api/core';
import type { RequestHistory, HttpRequest, HttpResponse } from '../types';

export const useHistoryStore = defineStore('history', () => {
  // State
  const history = ref<RequestHistory[]>([]);
  const selectedHistoryId = ref<string | null>(null);
  const isLoading = ref(false);

  // Getters
  function getHistoryById(id: string): RequestHistory | undefined {
    return history.value.find(h => h.id === id);
  }

  // Actions
  async function loadHistory(limit: number = 100) {
    isLoading.value = true;
    try {
      const data = await invoke<RequestHistory[]>('get_history', { limit });
      history.value = data;
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      isLoading.value = false;
    }
  }

  async function addToHistory(entry: RequestHistory) {
    try {
      await invoke('add_history', {
        req: {
          request: {
            method: entry.request.method,
            url: entry.request.url,
            headers: entry.request.headers,
            body: entry.request.body,
            body_type: entry.request.bodyType,
          },
          response: entry.response ? {
            status: entry.response.status,
            status_text: entry.response.statusText,
            headers: entry.response.headers,
            body: entry.response.body,
            content_type: entry.response.contentType,
            size: entry.response.size,
            time: entry.response.time,
          } : null,
        }
      });
      
      // Add to local state
      history.value.unshift(entry);
      if (history.value.length > 100) {
        history.value = history.value.slice(0, 100);
      }
    } catch (error) {
      console.error('Failed to add history entry:', error);
    }
  }

  async function removeFromHistory(id: string) {
    try {
      await invoke('delete_history_entry', { id });
      const index = history.value.findIndex(h => h.id === id);
      if (index !== -1) {
        history.value.splice(index, 1);
      }
    } catch (error) {
      console.error('Failed to delete history entry:', error);
    }
  }

  async function clearHistory() {
    try {
      await invoke('clear_history');
      history.value = [];
      selectedHistoryId.value = null;
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }

  function selectHistory(id: string | null) {
    selectedHistoryId.value = id;
  }

  // Legacy function for compatibility
  function loadTestHistory(data: RequestHistory[]) {
    history.value = data;
  }

  return {
    history,
    selectedHistoryId,
    isLoading,
    getHistoryById,
    loadHistory,
    addToHistory,
    removeFromHistory,
    clearHistory,
    selectHistory,
    loadTestHistory,
  };
});
