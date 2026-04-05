// Types for HTTP Client Application

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface HttpHeader {
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
  showDescription?: boolean;
}

export interface HttpRequest {
  id: string;
  name?: string;
  method: HttpMethod;
  url: string;
  headers: HttpHeader[];
  body?: string;
  bodyType: 'none' | 'raw' | 'formData' | 'urlEncoded';
  rawContentType?: string;
  createdAt: number;
  updatedAt: number;
}

export interface HttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  contentType: string;
  size: number;
  time: number;
  timestamp: number;
}

export interface RequestHistory {
  id: string;
  request: HttpRequest;
  response: HttpResponse;
  executedAt: number;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  folders: Folder[];
  requests: HttpRequest[];
  createdAt: number;
  updatedAt: number;
  color?: string;
}

export interface Folder {
  id: string;
  name: string;
  requests: HttpRequest[];
  createdAt: number;
  updatedAt: number;
}

export interface Environment {
  id: string;
  name: string;
  variables: EnvironmentVariable[];
  isGlobal?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface EnvironmentVariable {
  id?: number;
  key: string;
  value: string;
  type: 'default' | 'secret';
}

export interface RequestExecutionResult {
  success: boolean;
  request: HttpRequest;
  response?: HttpResponse;
  error?: string;
}

// For the Details Panel (matching reference image)
export interface RequestDetails {
  id: string;
  method: HttpMethod;
  status: number;
  statusText: string;
  url: string;
  referrer?: string;
  plugins?: string[];
  metadata?: string[];
  webhooks?: string[];
  timestamp: number;
  requestData: HttpRequest;
  responseData: HttpResponse;
}
