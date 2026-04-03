import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { Collection, Environment, EnvironmentVariable } from '../types';

export const useAppStore = defineStore('app', () => {
  // State
  const collections = ref<Collection[]>([]);
  const environments = ref<Environment[]>([]);
  const activeEnvironmentId = ref<string | null>(null);
  const sidebarActiveTab = ref<'collections' | 'history'>('collections');
  const isDetailsPanelOpen = ref(false);

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

  // Collection actions
  function addCollection(collection: Collection) {
    collections.value.push(collection);
  }

  function updateCollection(id: string, updates: Partial<Collection>) {
    const collection = collections.value.find(c => c.id === id);
    if (collection) {
      Object.assign(collection, { ...updates, updatedAt: Date.now() });
    }
  }

  function removeCollection(id: string) {
    const index = collections.value.findIndex(c => c.id === id);
    if (index !== -1) {
      collections.value.splice(index, 1);
    }
  }

  // Folder actions
  function addFolder(collectionId: string, folder: { id: string; name: string; requests: any[] }) {
    const collection = collections.value.find(c => c.id === collectionId);
    if (collection) {
      collection.folders.push({
        ...folder,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      collection.updatedAt = Date.now();
    }
  }

  function removeFolder(collectionId: string, folderId: string) {
    const collection = collections.value.find(c => c.id === collectionId);
    if (collection) {
      const index = collection.folders.findIndex(f => f.id === folderId);
      if (index !== -1) {
        collection.folders.splice(index, 1);
        collection.updatedAt = Date.now();
      }
    }
  }

  // Request actions within collections
  function addRequestToCollection(collectionId: string, request: any, folderId?: string) {
    const collection = collections.value.find(c => c.id === collectionId);
    if (collection) {
      if (folderId) {
        const folder = collection.folders.find(f => f.id === folderId);
        if (folder) {
          folder.requests.push(request);
          folder.updatedAt = Date.now();
        }
      } else {
        collection.requests.push(request);
      }
      collection.updatedAt = Date.now();
    }
  }

  function removeRequestFromCollection(collectionId: string, requestId: string, folderId?: string) {
    const collection = collections.value.find(c => c.id === collectionId);
    if (collection) {
      if (folderId) {
        const folder = collection.folders.find(f => f.id === folderId);
        if (folder) {
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
  }

  // Environment actions
  function addEnvironment(env: Environment) {
    environments.value.push(env);
    if (!activeEnvironmentId.value) {
      activeEnvironmentId.value = env.id;
    }
  }

  function setActiveEnvironment(id: string) {
    activeEnvironmentId.value = id;
  }

  function updateEnvironmentVariables(id: string, variables: EnvironmentVariable[]) {
    const env = environments.value.find(e => e.id === id);
    if (env) {
      env.variables = variables;
    }
  }

  // Load test data
  function loadTestData(data: { collections: Collection[]; environments: Environment[] }) {
    collections.value = data.collections;
    environments.value = data.environments;
    if (environments.value.length > 0 && !activeEnvironmentId.value) {
      activeEnvironmentId.value = environments.value[0].id;
    }
  }

  return {
    collections,
    environments,
    activeEnvironmentId,
    sidebarActiveTab,
    isDetailsPanelOpen,
    activeEnvironment,
    variables,
    setSidebarTab,
    toggleDetailsPanel,
    openDetailsPanel,
    closeDetailsPanel,
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
    loadTestData,
  };
});
