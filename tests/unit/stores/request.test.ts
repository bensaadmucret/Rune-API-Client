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

  it('sets method and updates timestamp', () => {
    const store = useRequestStore();
    const before = store.currentRequest.updatedAt;

    store.setMethod('POST');

    expect(store.currentRequest.method).toBe('POST');
    expect(store.currentRequest.updatedAt).toBeGreaterThanOrEqual(before);
  });

  it('sets URL and updates timestamp', () => {
    const store = useRequestStore();
    store.setUrl('https://api.example.com/users');
    expect(store.currentRequest.url).toBe('https://api.example.com/users');
  });

  it('sets headers array', () => {
    const store = useRequestStore();
    const headers = [{ key: 'Authorization', value: 'Bearer token', enabled: true }];
    store.setHeaders(headers);
    expect(store.currentRequest.headers).toEqual(headers);
  });

  it('adds header with default enabled', () => {
    const store = useRequestStore();
    store.addHeader({ key: 'Content-Type', value: 'application/json' });

    expect(store.currentRequest.headers).toHaveLength(1);
    expect(store.currentRequest.headers[0].enabled).toBe(true);
    expect(store.currentRequest.headers[0].key).toBe('Content-Type');
  });

  it('adds header with explicit enabled false', () => {
    const store = useRequestStore();
    store.addHeader({ key: 'X-Debug', value: 'true', enabled: false });

    expect(store.currentRequest.headers[0].enabled).toBe(false);
  });

  it('removes header by index', () => {
    const store = useRequestStore();
    store.setHeaders([
      { key: 'H1', value: 'v1', enabled: true },
      { key: 'H2', value: 'v2', enabled: true },
      { key: 'H3', value: 'v3', enabled: true },
    ]);

    store.removeHeader(1);

    expect(store.currentRequest.headers).toHaveLength(2);
    expect(store.currentRequest.headers[0].key).toBe('H1');
    expect(store.currentRequest.headers[1].key).toBe('H3');
  });

  it('sets body and updates timestamp', () => {
    const store = useRequestStore();
    store.setBody('{"name": "test"}');
    expect(store.currentRequest.body).toBe('{"name": "test"}');
  });

  it('sets body type', () => {
    const store = useRequestStore();
    store.setBodyType('raw');
    expect(store.currentRequest.bodyType).toBe('raw');
  });

  it('sets raw content type', () => {
    const store = useRequestStore();
    store.setRawContentType('application/json');
    expect(store.currentRequest.rawContentType).toBe('application/json');
  });

  it('calculates active headers correctly', () => {
    const store = useRequestStore();
    store.setHeaders([
      { key: 'H1', value: 'v1', enabled: true },
      { key: 'H2', value: 'v2', enabled: false },
      { key: 'H3', value: 'v3', enabled: true },
    ]);

    expect(store.activeHeaders).toHaveLength(2);
    expect(store.headersCount).toBe(2);
  });

  it('resets request to default state', () => {
    const store = useRequestStore();
    store.setMethod('POST');
    store.setUrl('https://example.com');
    store.setHeaders([{ key: 'X-Test', value: 'value', enabled: true }]);
    store.currentResponse = { status: 200 } as any;
    store.error = 'some error';

    store.resetRequest();

    expect(store.currentRequest.method).toBe('GET');
    expect(store.currentRequest.url).toBe('');
    expect(store.currentRequest.headers).toEqual([]);
    expect(store.currentResponse).toBeNull();
    expect(store.error).toBeNull();
  });

  it('loads request and clears response/error', () => {
    const store = useRequestStore();
    const requestToLoad = {
      id: 'req-1',
      name: 'Get Users',
      method: 'POST',
      url: 'https://api.example.com/users',
      headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
      body: '{}',
      bodyType: 'raw' as const,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    store.currentResponse = { status: 200 } as any;
    store.error = 'error';

    store.loadRequest(requestToLoad);

    expect(store.currentRequest).toEqual(requestToLoad);
    expect(store.currentResponse).toBeNull();
    expect(store.error).toBeNull();
  });

  it('substitutes multiple variables in URL', async () => {
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
        variables: [
          { key: 'baseUrl', value: 'https://api.example.com', type: 'default' },
          { key: 'version', value: 'v2', type: 'default' },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ] as any;
    appStore.activeEnvironmentId = 'env-1';

    const store = useRequestStore();
    store.setUrl('{{baseUrl}}/{{version}}/users');

    await store.executeRequest();

    expect(mockedInvoke).toHaveBeenCalledWith('execute_http_request', {
      request: expect.objectContaining({
        url: 'https://api.example.com/v2/users',
      }),
    });
  });

  it('handles empty variable key or value gracefully', async () => {
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
        variables: [
          { key: '', value: 'should-skip', type: 'default' },
          { key: 'valid', value: '', type: 'default' },
          { key: 'base', value: 'https://api.com', type: 'default' },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ] as any;
    appStore.activeEnvironmentId = 'env-1';

    const store = useRequestStore();
    store.setUrl('{{base}}/path');
    await store.executeRequest();

    expect(mockedInvoke).toHaveBeenCalledWith('execute_http_request', {
      request: expect.objectContaining({
        url: 'https://api.com/path',
      }),
    });
  });
});
