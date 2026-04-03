import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { RequestHistory } from '../types';

export const useHistoryStore = defineStore('history', () => {
  // State
  const history = ref<RequestHistory[]>([]);
  const selectedHistoryId = ref<string | null>(null);

  // Getters
  function getHistoryById(id: string): RequestHistory | undefined {
    return history.value.find(h => h.id === id);
  }

  // Actions
  function addToHistory(entry: RequestHistory) {
    // Add to beginning, limit to 100 entries
    history.value.unshift(entry);
    if (history.value.length > 100) {
      history.value = history.value.slice(0, 100);
    }
  }

  function removeFromHistory(id: string) {
    const index = history.value.findIndex(h => h.id === id);
    if (index !== -1) {
      history.value.splice(index, 1);
    }
  }

  function clearHistory() {
    history.value = [];
    selectedHistoryId.value = null;
  }

  function selectHistory(id: string | null) {
    selectedHistoryId.value = id;
  }

  function loadTestHistory(data: RequestHistory[]) {
    history.value = data;
  }

  return {
    history,
    selectedHistoryId,
    getHistoryById,
    addToHistory,
    removeFromHistory,
    clearHistory,
    selectHistory,
    loadTestHistory,
  };
});
