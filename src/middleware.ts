import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Global in-memory map for rate limiting (persisted across Edge requests in same isolate)
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up expired records every 5 minutes to avoid memory accumulation
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 300000);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // 1. IP extraction for rate limiting
  const ip = (req as any).ip || req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '127.0.0.1';


  // 2. Identify the rate limit category
  let limitType: 'auth' | 'write' | 'read' = 'read';
  if (pathname.startsWith('/api/auth/')) {
    limitType = 'auth';
  } else if (method === 'POST' || method === 'PATCH' || method === 'PUT' || method === 'DELETE') {
    limitType = 'write';
  }

  // Define limits & window
  const windowMs = 60000; // 60 seconds
  let limit = 60; // default read limit: 60/min
  if (limitType === 'auth') {
    limit = 10; // auth limit: 10/min
  } else if (limitType === 'write') {
    limit = 30; // write limit: 30/min
  }

  const now = Date.now();
  const rateLimitKey = `${ip}:${limitType}`;
  const record = rateLimitMap.get(rateLimitKey);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(rateLimitKey, {
      count: 1,
      resetTime: now + windowMs,
    });
  } else {
    record.count += 1;
    if (record.count > limit) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests. Please try again later.',
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
          },
        }
      );
    }
  }

  // 3. Route Protection
  const sessionToken = req.cookies.get('next-auth.session-token')?.value || 
                       req.cookies.get('__Secure-next-auth.session-token')?.value;

  // Protected paths list
  const protectedPrefixes = [
    '/dashboard',
    '/explore',
    '/compare',
    '/discussions',
    '/saved',
    '/predict',
    '/essay-predictor',
  ];

  const isProtectedPath = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isProtectedPath) {
    if (!sessionToken) {
      // Not logged in -> redirect to login with callback URL
      const loginUrl = new URL('/auth', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Logged in user hitting auth page -> redirect to dashboard
  if (pathname.startsWith('/auth') && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, png, svg assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.jpeg).*)',
  ],
};
