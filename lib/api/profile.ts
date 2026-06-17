import { apiRequest } from '@/lib/api/client';
import { normalizeUser } from '@/lib/api/normalize';
import type { SessionUser } from '@/lib/types/user';

export type UpdateProfilePayload = {
  name: string;
  phone: string;
};

export async function updateProfileApi(payload: UpdateProfilePayload): Promise<SessionUser> {
  const data = await apiRequest<Parameters<typeof normalizeUser>[0]>('/api/user/profile', {
    method: 'PATCH',
    auth: true,
    body: payload,
  });
  return normalizeUser(data);
}
