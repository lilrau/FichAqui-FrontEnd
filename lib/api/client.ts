import { getApiBaseUrl } from '@/lib/api/config';
import { ApiError } from '@/lib/api/errors';
import { clearAuthToken, getAuthToken } from '@/lib/api/token';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  auth?: boolean;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = false, headers: initHeaders, ...init } = options;
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

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

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
