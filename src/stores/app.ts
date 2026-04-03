import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { invoke } from '@tauri-apps/api/core';
import type { Collection, Environment, EnvironmentVariable, Folder } from '../types';

export const useAppStore = defineStore('app', () => {
  // State
  const collections = ref<Collection[]>([]);
  const environments = ref<Environment[]>([]);
  const activeEnvironmentId = ref<string | null>(null);
  const sidebarActiveTab = ref<'collections' | 'history'>('collections');
  const isDetailsPanelOpen = ref(false);
  const isLoading = ref(false);

  // Getters
  const activeEnvironment = computed(() => {
    return environments.value.find(e => e.id === activeEnvironmentId.value);
  });

  const variables = computed(() => {
    const envVars = activeEnvironment.value?.variables || [];
    return envVars;
  });

  // Actions
  function setSidebarTab(tab: 'collections' | 'history') {
    sidebarActiveTab.value = tab;
  }

  function toggleDetailsPanel() {
    isDetailsPanelOpen.value = !isDetailsPanelOpen.value;
  }

  function openDetailsPanel() {
    isDetailsPanelOpen.value = true;
  }

  function closeDetailsPanel() {
    isDetailsPanelOpen.value = false;
  }

  // Load data from SQLite
  async function loadCollections() {
    isLoading.value = true;
    try {
      const data = await invoke<Collection[]>('get_collections');
      // Load folders and requests for each collection
      for (const collection of data) {
        collection.folders = await invoke<Folder[]>('get_folders', { collection_id: collection.id });
        collection.requests = await invoke('get_requests', { collection_id: collection.id, folder_id: null });
      }
      collections.value = data;
    } catch (error) {
      console.error('Failed to load collections:', error);
    } finally {
      isLoading.value = false;
    }
  }

  async function loadEnvironments() {
    try {
      const data = await invoke<Environment[]>('get_environments');
      // Load variables for each environment
      for (const env of data) {
        env.variables = await invoke<EnvironmentVariable[]>('get_environment_variables', { environment_id: env.id });
      }
      environments.value = data;
      if (data.length > 0 && !activeEnvironmentId.value) {
        activeEnvironmentId.value = data[0].id;
      }
    } catch (error) {
      console.error('Failed to load environments:', error);
    }
  }

  // Collection actions with SQLite
  async function addCollection(collection: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const newCollection = await invoke<Collection>('create_collection', {
        req: {
          name: collection.name,
          description: collection.description,
          color: collection.color,
        }
      });
      newCollection.folders = [];
      newCollection.requests = [];
      collections.value.push(newCollection);
      return newCollection;
    } catch (error) {
      console.error('Failed to create collection:', error);
      throw error;
    }
  }

  async function updateCollection(id: string, updates: Partial<Collection>) {
    try {
      const collection = collections.value.find(c => c.id === id);
      if (collection) {
        await invoke('update_collection', {
          id,
          req: {
            name: updates.name || collection.name,
            description: updates.description ?? collection.description,
            color: updates.color ?? collection.color,
          }
        });
        Object.assign(collection, { ...updates, updatedAt: Date.now() });
      }
    } catch (error) {
      console.error('Failed to update collection:', error);
    }
  }

  async function removeCollection(id: string) {
    try {
      await invoke('delete_collection', { id });
      const index = collections.value.findIndex(c => c.id === id);
      if (index !== -1) {
        collections.value.splice(index, 1);
      }
    } catch (error) {
      console.error('Failed to delete collection:', error);
    }
  }

  // Folder actions with SQLite
  async function addFolder(collectionId: string, folder: { id?: string; name: string; requests?: any[] }) {
    try {
      const newFolder = await invoke<Folder>('create_folder', {
        req: {
          collection_id: collectionId,
          name: folder.name,
        }
      });
      newFolder.requests = [];
      const collection = collections.value.find(c => c.id === collectionId);
      if (collection) {
        collection.folders.push(newFolder);
        collection.updatedAt = Date.now();
      }
      return newFolder;
    } catch (error) {
      console.error('Failed to create folder:', error);
      throw error;
    }
  }

  async function removeFolder(collectionId: string, folderId: string) {
    try {
      await invoke('delete_folder', { id: folderId });
      const collection = collections.value.find(c => c.id === collectionId);
      if (collection) {
        const index = collection.folders.findIndex(f => f.id === folderId);
        if (index !== -1) {
          collection.folders.splice(index, 1);
          collection.updatedAt = Date.now();
        }
      }
    } catch (error) {
      console.error('Failed to delete folder:', error);
    }
  }

  // Request actions within collections
  async function addRequestToCollection(collectionId: string, request: any, folderId?: string) {
    try {
      const newRequest = await invoke('create_request', {
        req: {
          collection_id: collectionId,
          folder_id: folderId,
          name: request.name,
          method: request.method,
          url: request.url,
          headers: request.headers,
          body: request.body,
          body_type: request.bodyType,
          raw_content_type: request.rawContentType,
        }
      });
      
      const collection = collections.value.find(c => c.id === collectionId);
      if (collection) {
        if (folderId) {
          const folder = collection.folders.find(f => f.id === folderId);
          if (folder) {
            folder.requests = folder.requests || [];
            folder.requests.push(newRequest);
            folder.updatedAt = Date.now();
          }
        } else {
          collection.requests.push(newRequest);
        }
        collection.updatedAt = Date.now();
      }
      return newRequest;
    } catch (error) {
      console.error('Failed to create request:', error);
      throw error;
    }
  }

  async function removeRequestFromCollection(collectionId: string, requestId: string, folderId?: string) {
    try {
      await invoke('delete_request', { id: requestId });
      const collection = collections.value.find(c => c.id === collectionId);
      if (collection) {
        if (folderId) {
          const folder = collection.folders.find(f => f.id === folderId);
          if (folder && folder.requests) {
            const index = folder.requests.findIndex((r: any) => r.id === requestId);
            if (index !== -1) {
              folder.requests.splice(index, 1);
              folder.updatedAt = Date.now();
            }
          }
        } else {
          const index = collection.requests.findIndex(r => r.id === requestId);
          if (index !== -1) {
            collection.requests.splice(index, 1);
          }
        }
        collection.updatedAt = Date.now();
      }
    } catch (error) {
      console.error('Failed to delete request:', error);
    }
  }

  // Environment actions with SQLite
  async function addEnvironment(env: Omit<Environment, 'id' | 'variables'>) {
    try {
      const newEnv = await invoke<Environment>('create_environment', {
        req: {
          name: env.name,
          is_global: env.isGlobal || false,
        }
      });
      newEnv.variables = [];
      environments.value.push(newEnv);
      if (!activeEnvironmentId.value) {
        activeEnvironmentId.value = newEnv.id;
      }
      return newEnv;
    } catch (error) {
      console.error('Failed to create environment:', error);
      throw error;
    }
  }

  function setActiveEnvironment(id: string) {
    activeEnvironmentId.value = id;
  }

  async function updateEnvironmentVariables(id: string, variables: EnvironmentVariable[]) {
    try {
      await invoke('set_environment_variables', {
        environment_id: id,
        variables: variables.map(v => ({
          ...v,
          var_type: v.type,
        }))
      });
      const env = environments.value.find(e => e.id === id);
      if (env) {
        env.variables = variables;
      }
    } catch (error) {
      console.error('Failed to update environment variables:', error);
    }
  }

  async function removeEnvironment(id: string) {
    try {
      await invoke('delete_environment', { id });
      const index = environments.value.findIndex(e => e.id === id);
      if (index !== -1) {
        environments.value.splice(index, 1);
        if (activeEnvironmentId.value === id) {
          activeEnvironmentId.value = environments.value.length > 0 ? environments.value[0].id : null;
        }
      }
    } catch (error) {
      console.error('Failed to delete environment:', error);
    }
  }

  // Initialize data
  async function initialize() {
    await Promise.all([
      loadCollections(),
      loadEnvironments(),
    ]);
  }

  return {
    collections,
    environments,
    activeEnvironmentId,
    sidebarActiveTab,
    isDetailsPanelOpen,
    isLoading,
    activeEnvironment,
    variables,
    setSidebarTab,
    toggleDetailsPanel,
    openDetailsPanel,
    closeDetailsPanel,
    loadCollections,
    loadEnvironments,
    addCollection,
    updateCollection,
    removeCollection,
    addFolder,
    removeFolder,
    addRequestToCollection,
    removeRequestFromCollection,
    addEnvironment,
    setActiveEnvironment,
    updateEnvironmentVariables,
    removeEnvironment,
    initialize,
  };
});
