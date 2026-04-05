import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../../../src/stores/app';
import { useRequestStore } from '../../../src/stores/request';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

const mockedInvoke = vi.mocked(invoke);

describe('Request Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('substitutes environment variables safely in url and headers', async () => {
    mockedInvoke.mockResolvedValue({
      success: true,
      response: {
        status: 200,
        status_text: 'OK',
        headers: {},
        body: 'ok',
        content_type: 'text/plain',
        size: 2,
        time: 10,
      },
    } as any);

    const appStore = useAppStore();
    appStore.environments = [
      {
        id: 'env-1',
        name: 'Dev',
        variables: [{ key: 'api.key+', value: 'VALUE-123', type: 'default' }],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ] as any;
    appStore.activeEnvironmentId = 'env-1';

    const store = useRequestStore();
    store.setUrl('https://example.com/{{ api.key+ }}');
    store.setHeaders([{ key: 'X-Token', value: '{{api.key+}}', enabled: true }]);

    const result = await store.executeRequest();

    expect(result.success).toBe(true);
    expect(mockedInvoke).toHaveBeenCalledWith('execute_http_request', {
      request: {
        method: 'GET',
        url: 'https://example.com/VALUE-123',
        headers: [{ key: 'X-Token', value: 'VALUE-123', enabled: true }],
        body: null,
      },
    });
  });

  it('maps successful backend response to HttpResponse shape', async () => {
    mockedInvoke.mockResolvedValue({
      success: true,
      response: {
        status: 201,
        status_text: 'Created',
        headers: { 'content-type': 'application/json' },
        body: '{"ok":true}',
        content_type: 'application/json',
        size: 11,
        time: 42,
      },
    } as any);

    const store = useRequestStore();
    const result = await store.executeRequest();

    expect(result.success).toBe(true);
    expect(store.currentResponse?.status).toBe(201);
    expect(store.currentResponse?.statusText).toBe('Created');
    expect(store.currentResponse?.contentType).toBe('application/json');
    expect(store.isLoading).toBe(false);
  });

  it('handles invoke errors and exposes user-facing error state', async () => {
    mockedInvoke.mockRejectedValueOnce(new Error('network down'));

    const store = useRequestStore();
    const result = await store.executeRequest();

    expect(result.success).toBe(false);
    expect(result.error).toBe('network down');
    expect(store.error).toBe('network down');
    expect(store.isLoading).toBe(false);
  });

  it('handles backend error payload when success is false', async () => {
    mockedInvoke.mockResolvedValue({ success: false, error: 'Bad request' } as any);

    const store = useRequestStore();
    const result = await store.executeRequest();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Bad request');
    expect(store.error).toBe('Bad request');
  });
});
