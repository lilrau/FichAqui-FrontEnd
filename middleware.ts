import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LEGACY_ADMIN_PATHS = ['barracas', 'evento', 'pedidos', 'relatorios'] as const;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  for (const segment of LEGACY_ADMIN_PATHS) {
    if (pathname === `/admin/${segment}`) {
      const lastEventId =
        request.cookies.get('event-app:last-admin-event')?.value ?? '1';
      const url = request.nextUrl.clone();
      url.pathname = `/admin/${lastEventId}/${segment}`;
      return NextResponse.redirect(url);
    }
  }

  const adminEventMatch = pathname.match(/^\/admin\/([^/]+)/);
  if (adminEventMatch && !['novo', 'config'].includes(adminEventMatch[1])) {
    const response = NextResponse.next();
    response.cookies.set('event-app:last-admin-event', adminEventMatch[1], {
      path: '/',
      sameSite: 'lax',
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
