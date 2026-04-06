import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../../../src/stores/app';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

const mockedInvoke = vi.mocked(invoke);

describe('App Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('maps environment variables and sets first environment active', async () => {
    mockedInvoke.mockImplementation((command: string, args?: any) => {
      if (command === 'get_environments') {
        return Promise.resolve([{ id: 'env-1', name: 'Dev', is_global: 0 }] as any);
      }
      if (command === 'get_environment_variables') {
        expect(args.environmentId).toBe('env-1');
        return Promise.resolve([
          { id: 1, environment_id: 'env-1', key: 'TOKEN', value: 'abc', var_type: 'secret' },
        ] as any);
      }
      return Promise.resolve([] as any);
    });

    const store = useAppStore();
    await store.loadEnvironments();

    expect(store.environments).toHaveLength(1);
    expect(store.environments[0].variables[0].type).toBe('secret');
    expect(store.activeEnvironmentId).toBe('env-1');
  });

  it('sends camelCase payload and updates local variables on updateEnvironmentVariables', async () => {
    mockedInvoke.mockResolvedValue(undefined as any);

    const store = useAppStore();
    store.environments = [
      {
        id: 'env-1',
        name: 'Dev',
        variables: [],
        isGlobal: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ] as any;

    await store.updateEnvironmentVariables('env-1', [
      { id: 1, key: 'API_URL', value: 'https://api.example.com', type: 'default' },
    ]);

    expect(mockedInvoke).toHaveBeenCalledWith('set_environment_variables', {
      environmentId: 'env-1',
      variables: [
        {
          id: 1,
          environmentId: 'env-1',
          key: 'API_URL',
          value: 'https://api.example.com',
          varType: 'default',
        },
      ],
    });

    expect(store.environments[0].variables).toHaveLength(1);
    expect(store.environments[0].variables[0].key).toBe('API_URL');
  });

  it('falls back to next environment when removing active one', async () => {
    mockedInvoke.mockResolvedValue(undefined as any);

    const store = useAppStore();
    store.environments = [
      {
        id: 'env-1',
        name: 'Dev',
        variables: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'env-2',
        name: 'Prod',
        variables: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ] as any;
    store.activeEnvironmentId = 'env-1';

    await store.removeEnvironment('env-1');

    expect(store.environments).toHaveLength(1);
    expect(store.environments[0].id).toBe('env-2');
    expect(store.activeEnvironmentId).toBe('env-2');
  });

  it('resets loading flag when loadCollections fails', async () => {
    mockedInvoke.mockRejectedValueOnce(new Error('db down'));

    const store = useAppStore();
    await store.loadCollections();

    expect(store.isLoading).toBe(false);
  });

  it('toggles details panel', () => {
    const store = useAppStore();
    expect(store.isDetailsPanelOpen).toBe(false);

    store.toggleDetailsPanel();
    expect(store.isDetailsPanelOpen).toBe(true);

    store.toggleDetailsPanel();
    expect(store.isDetailsPanelOpen).toBe(false);
  });

  it('opens and closes details panel', () => {
    const store = useAppStore();

    store.openDetailsPanel();
    expect(store.isDetailsPanelOpen).toBe(true);

    store.closeDetailsPanel();
    expect(store.isDetailsPanelOpen).toBe(false);
  });

  it('sets sidebar tab', () => {
    const store = useAppStore();
    expect(store.sidebarActiveTab).toBe('collections');

    store.setSidebarTab('history');
    expect(store.sidebarActiveTab).toBe('history');
  });

  it('sets active environment', () => {
    const store = useAppStore();
    store.environments = [
      { id: 'env-1', name: 'Dev', variables: [], createdAt: Date.now(), updatedAt: Date.now() },
      { id: 'env-2', name: 'Prod', variables: [], createdAt: Date.now(), updatedAt: Date.now() },
    ] as any;

    store.setActiveEnvironment('env-2');
    expect(store.activeEnvironmentId).toBe('env-2');
    expect(store.activeEnvironment?.name).toBe('Prod');
  });

  it('returns empty variables when no active environment', () => {
    const store = useAppStore();
    store.activeEnvironmentId = null;
    expect(store.variables).toEqual([]);
  });

  it('adds collection and returns it', async () => {
    const mockCollection = { id: 'col-1', name: 'API Tests', folders: [], requests: [] };
    mockedInvoke.mockResolvedValue(mockCollection as any);

    const store = useAppStore();
    const result = await store.addCollection({
      name: 'API Tests',
      description: '',
      color: '#3b82f6',
      folders: [],
      requests: [],
    });

    expect(result.id).toBe('col-1');
    expect(store.collections).toHaveLength(1);
    expect(mockedInvoke).toHaveBeenCalledWith('create_collection', {
      req: {
        name: 'API Tests',
        description: '',
        color: '#3b82f6',
      },
    });
  });

  it('updates collection locally', async () => {
    mockedInvoke.mockResolvedValue(undefined as any);

    const store = useAppStore();
    store.collections = [
      { id: 'col-1', name: 'Old Name', description: '', color: '#000', updatedAt: 1000 } as any,
    ];

    await store.updateCollection('col-1', { name: 'New Name' });

    expect(store.collections[0].name).toBe('New Name');
    expect(store.collections[0].updatedAt).toBeGreaterThan(1000);
  });

  it('removes collection and updates state', async () => {
    mockedInvoke.mockResolvedValue(undefined as any);

    const store = useAppStore();
    store.collections = [
      { id: 'col-1', name: 'Test', folders: [], requests: [] } as any,
      { id: 'col-2', name: 'Other', folders: [], requests: [] } as any,
    ];

    await store.removeCollection('col-1');

    expect(store.collections).toHaveLength(1);
    expect(store.collections[0].id).toBe('col-2');
  });

  it('adds folder to collection', async () => {
    const mockFolder = { id: 'folder-1', name: 'Auth', requests: [] };
    mockedInvoke.mockResolvedValue(mockFolder as any);

    const store = useAppStore();
    store.collections = [
      { id: 'col-1', name: 'API', folders: [], requests: [], updatedAt: 1000 } as any,
    ];

    const result = await store.addFolder('col-1', { name: 'Auth' });

    expect(result.id).toBe('folder-1');
    expect(store.collections[0].folders).toHaveLength(1);
    expect(store.collections[0].folders[0].name).toBe('Auth');
  });

  it('removes folder from collection', async () => {
    mockedInvoke.mockResolvedValue(undefined as any);

    const store = useAppStore();
    store.collections = [
      {
        id: 'col-1',
        name: 'API',
        folders: [{ id: 'f-1', name: 'Auth', requests: [] }],
        requests: [],
        updatedAt: 1000,
      } as any,
    ];

    await store.removeFolder('col-1', 'f-1');

    expect(store.collections[0].folders).toHaveLength(0);
  });

  it('adds environment and sets it active', async () => {
    const mockEnv = { id: 'env-new', name: 'Staging', variables: [] };
    mockedInvoke.mockResolvedValue(mockEnv as any);

    const store = useAppStore();
    const result = await store.addEnvironment({ name: 'Staging' });

    expect(result.id).toBe('env-new');
    expect(store.activeEnvironmentId).toBe('env-new');
    expect(store.environments).toHaveLength(1);
  });

  it('removes environment and clears active when last one', async () => {
    mockedInvoke.mockResolvedValue(undefined as any);

    const store = useAppStore();
    store.environments = [
      {
        id: 'env-1',
        name: 'Dev',
        variables: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as any,
    ];
    store.activeEnvironmentId = 'env-1';

    await store.removeEnvironment('env-1');

    expect(store.environments).toHaveLength(0);
    expect(store.activeEnvironmentId).toBeNull();
  });

  it('initializes data by loading collections and environments', async () => {
    mockedInvoke.mockImplementation((cmd: string) => {
      if (cmd === 'get_collections') return Promise.resolve([]);
      if (cmd === 'get_environments') return Promise.resolve([]);
      return Promise.resolve([]);
    });

    const store = useAppStore();
    await store.initialize();

    expect(mockedInvoke).toHaveBeenCalledWith('get_collections');
    expect(mockedInvoke).toHaveBeenCalledWith('get_environments');
  });

  it('loads collections with folders and requests', async () => {
    const mockCollection = { id: 'col-1', name: 'Test', folders: [], requests: [] };
    mockedInvoke.mockImplementation((cmd: string, _args?: any) => {
      if (cmd === 'get_collections') return Promise.resolve([mockCollection]);
      if (cmd === 'get_folders') return Promise.resolve([{ id: 'f-1', name: 'Folder1' }]);
      if (cmd === 'get_requests') return Promise.resolve([{ id: 'req-1', name: 'Request1' }]);
      return Promise.resolve([]);
    });

    const store = useAppStore();
    await store.loadCollections();

    expect(store.collections).toHaveLength(1);
    expect(store.collections[0].folders).toHaveLength(1);
    expect(store.collections[0].requests).toHaveLength(1);
  });
});
