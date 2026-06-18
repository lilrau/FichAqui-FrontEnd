import { getApiBaseUrl } from '@/lib/api/config';
import { ApiError } from '@/lib/api/errors';
import { clearAuthToken, getAuthToken } from '@/lib/api/token';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  auth?: boolean;
};

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function readXsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function fetchCsrfCookie(): Promise<void> {
  await fetch(`${getApiBaseUrl()}/sanctum/csrf-cookie`, {
    credentials: 'include',
  });
}

async function applyCsrfHeader(headers: Headers): Promise<void> {
  if (!readXsrfToken()) {
    await fetchCsrfCookie();
  }
  const xsrf = readXsrfToken();
  if (xsrf) {
    headers.set('X-XSRF-TOKEN', xsrf);
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = false, headers: initHeaders, ...init } = options;
  const method = (init.method ?? 'GET').toUpperCase();
  const headers = new Headers(initHeaders);

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
  } else {
    headers.set('Accept', 'application/json');
  }

  if (auth) {
    const token = getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  if (MUTATING_METHODS.has(method)) {
    await applyCsrfHeader(headers);
  }

  const request = () =>
    fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      headers,
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

  let response = await request();

  if (response.status === 419 && MUTATING_METHODS.has(method)) {
    await fetchCsrfCookie();
    await applyCsrfHeader(headers);
    response = await request();
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthToken();
    }
    const message =
      (payload && typeof payload.message === 'string' && payload.message) ||
      `Erro HTTP ${response.status}`;
    const errors =
      payload && typeof payload.errors === 'object' ? (payload.errors as Record<string, string[]>) : undefined;
    throw new ApiError(response.status, message, errors);
  }

  return payload as T;
}
