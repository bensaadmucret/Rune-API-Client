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
});
