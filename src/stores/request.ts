import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { invoke } from '@tauri-apps/api/core';
import type { HttpRequest, HttpResponse, HttpMethod, HttpHeader, RequestExecutionResult } from '../types';
import { useAppStore } from './app';

export const useRequestStore = defineStore('request', () => {
  // Get app store for environment variables
  const appStore = useAppStore();

  // State
  const currentRequest = ref<HttpRequest>({
    id: '',
    method: 'GET',
    url: '',
    headers: [],
    bodyType: 'none',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  const currentResponse = ref<HttpResponse | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const activeHeaders = computed(() => {
    return currentRequest.value.headers.filter(h => h.enabled);
  });

  const headersCount = computed(() => activeHeaders.value.length);

  // Actions
  function setMethod(method: HttpMethod) {
    currentRequest.value.method = method;
    currentRequest.value.updatedAt = Date.now();
  }

  function setUrl(url: string) {
    currentRequest.value.url = url;
    currentRequest.value.updatedAt = Date.now();
  }

  function setHeaders(headers: HttpHeader[]) {
    currentRequest.value.headers = headers;
    currentRequest.value.updatedAt = Date.now();
  }

  function addHeader(header: Omit<HttpHeader, 'enabled'> & { enabled?: boolean }) {
    currentRequest.value.headers.push({
      ...header,
      enabled: header.enabled ?? true,
    });
    currentRequest.value.updatedAt = Date.now();
  }

  function removeHeader(index: number) {
    currentRequest.value.headers.splice(index, 1);
    currentRequest.value.updatedAt = Date.now();
  }

  function setBody(body: string) {
    currentRequest.value.body = body;
    currentRequest.value.updatedAt = Date.now();
  }

  function setBodyType(bodyType: HttpRequest['bodyType']) {
    currentRequest.value.bodyType = bodyType;
    currentRequest.value.updatedAt = Date.now();
  }

  function setRawContentType(contentType: string) {
    currentRequest.value.rawContentType = contentType;
    currentRequest.value.updatedAt = Date.now();
  }

  function resetRequest() {
    currentRequest.value = {
      id: '',
      method: 'GET',
      url: '',
      headers: [],
      bodyType: 'none',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    currentResponse.value = null;
    error.value = null;
  }

  function loadRequest(request: HttpRequest) {
    currentRequest.value = { ...request };
    currentResponse.value = null;
    error.value = null;
  }

  // Helper function to substitute environment variables {{var}}
  function substituteVariables(text: string): string {
    const env = appStore.activeEnvironment;
    if (!env) return text;

    let result = text;
    env.variables.forEach(variable => {
      if (variable.key && variable.value) {
        const regex = new RegExp(`{{\\s*${variable.key}\\s*}}`, 'g');
        result = result.replace(regex, variable.value);
      }
    });
    return result;
  }

  async function executeRequest(): Promise<RequestExecutionResult> {
    isLoading.value = true;
    error.value = null;

    try {
      // Substitute environment variables in URL, headers, and body
      const substitutedUrl = substituteVariables(currentRequest.value.url);
      const substitutedHeaders = currentRequest.value.headers.map(h => ({
        ...h,
        key: substituteVariables(h.key),
        value: substituteVariables(h.value),
      }));
      const substitutedBody = currentRequest.value.body 
        ? substituteVariables(currentRequest.value.body)
        : null;

      const requestData = {
        method: currentRequest.value.method,
        url: substitutedUrl,
        headers: substitutedHeaders.map(h => ({
          key: h.key,
          value: h.value,
          enabled: h.enabled,
        })),
        body: currentRequest.value.bodyType !== 'none' ? substitutedBody : null,
      };

      const result = await invoke<{
        success: boolean;
        response?: {
          status: number;
          status_text: string;
          headers: Record<string, string>;
          body: string;
          content_type: string;
          size: number;
          time: number;
        };
        error?: string;
      }>('execute_http_request', { request: requestData });

      if (result.success && result.response) {
        const response: HttpResponse = {
          status: result.response.status,
          statusText: result.response.status_text,
          headers: result.response.headers,
          body: result.response.body,
          contentType: result.response.content_type,
          size: result.response.size,
          time: result.response.time,
          timestamp: Date.now(),
        };

        currentResponse.value = response;
        isLoading.value = false;

        return {
          success: true,
          request: currentRequest.value,
          response,
        };
      } else {
        const errorMsg = result.error || 'Unknown error';
        error.value = errorMsg;
        isLoading.value = false;

        return {
          success: false,
          request: currentRequest.value,
          error: errorMsg,
        };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      error.value = errorMsg;
      isLoading.value = false;

      return {
        success: false,
        request: currentRequest.value,
        error: errorMsg,
      };
    }
  }

  return {
    currentRequest,
    currentResponse,
    isLoading,
    error,
    activeHeaders,
    headersCount,
    setMethod,
    setUrl,
    setHeaders,
    addHeader,
    removeHeader,
    setBody,
    setBodyType,
    setRawContentType,
    resetRequest,
    loadRequest,
    executeRequest,
  };
});
