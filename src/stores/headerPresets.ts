import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { invoke } from '@tauri-apps/api/core';

export interface HttpHeader {
  key: string;
  value: string;
  enabled: boolean;
}

export interface HeaderPreset {
  id: string;
  name: string;
  description?: string;
  headers: HttpHeader[];
  is_builtin: number;
  created_at: number;
  updated_at: number;
}

export interface CreateHeaderPresetRequest {
  name: string;
  description?: string;
  headers: HttpHeader[];
}

export const useHeaderPresetStore = defineStore('headerPresets', () => {
  // State
  const presets = ref<HeaderPreset[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const builtinPresets = computed(() => presets.value.filter(p => p.is_builtin === 1));
  const customPresets = computed(() => presets.value.filter(p => p.is_builtin === 0));
  const allPresets = computed(() => [...builtinPresets.value, ...customPresets.value]);

  // Actions
  async function loadPresets() {
    isLoading.value = true;
    error.value = null;
    try {
      const result = await invoke<HeaderPreset[]>('get_header_presets');
      presets.value = Array.isArray(result) ? result : [];
    } catch (e) {
      error.value = String(e);
      console.error('Failed to load header presets:', e);
      presets.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  async function createPreset(req: CreateHeaderPresetRequest) {
    isLoading.value = true;
    error.value = null;
    try {
      const result = await invoke<HeaderPreset>('create_header_preset', { req });
      presets.value.push(result);
      return result;
    } catch (e) {
      error.value = String(e);
      console.error('Failed to create header preset:', e);
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function updatePreset(id: string, req: CreateHeaderPresetRequest) {
    isLoading.value = true;
    error.value = null;
    try {
      await invoke('update_header_preset', { id, req });
      const index = presets.value.findIndex(p => p.id === id);
      
      if (index === -1) {
        throw new Error('Preset not found');
      }
      
      if (presets.value[index].is_builtin === 1) {
        throw new Error('Cannot update builtin');
      }
      
      presets.value[index] = {
        ...presets.value[index],
        ...req,
        updated_at: Date.now(),
      };
    } catch (e) {
      error.value = String(e);
      console.error('Failed to update header preset:', e);
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function deletePreset(id: string) {
    isLoading.value = true;
    error.value = null;
    try {
      const preset = presets.value.find(p => p.id === id);
      if (!preset) throw new Error('Preset not found');
      if (preset.is_builtin === 1) throw new Error('Cannot delete builtin');
      
      await invoke('delete_header_preset', { id });
      presets.value = presets.value.filter(p => p.id !== id);
    } catch (e) {
      error.value = String(e);
      console.error('Failed to delete header preset:', e);
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  function getPresetHeaders(id: string): HttpHeader[] {
    return presets.value.find(p => p.id === id)?.headers ?? [];
  }

  return {
    presets,
    isLoading,
    error,
    builtinPresets,
    customPresets,
    allPresets,
    loadPresets,
    createPreset,
    updatePreset,
    deletePreset,
    getPresetHeaders,
  };
});
