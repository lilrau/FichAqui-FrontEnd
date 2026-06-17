import { apiRequest } from '@/lib/api/client';
import { normalizeUser } from '@/lib/api/normalize';
import { setAuthToken, clearAuthToken } from '@/lib/api/token';
import type { SessionUser } from '@/lib/types/user';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role?: string;
    roles?: string[];
    organizerId?: string | null;
  };
}

export async function loginApi(email: string, password: string): Promise<SessionUser> {
  const data = await apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  setAuthToken(data.token);
  return normalizeUser(data.user);
}

export async function meApi(): Promise<SessionUser> {
  const data = await apiRequest<LoginResponse['user']>('/api/auth/me', { auth: true });
  return normalizeUser(data);
}

export async function logoutApi(): Promise<void> {
  try {
    await apiRequest('/api/auth/logout', { method: 'POST', auth: true });
  } finally {
    clearAuthToken();
  }
}
