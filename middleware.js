import { NextResponse } from 'next/server';
import {
  BLOG_ADMIN_SESSION_COOKIE_NAME,
  buildAdminLoginPath,
  verifySignedBlogSessionToken
} from './src/lib/server/blog/session.mjs';

/**
 * Technical SEO Middleware
 * Handles:
 * 1. Admin authentication
 * 2. Legacy tool query parameter redirects (301)
 * 3. Cleanup of ?tool= param from clean SEO routes
 */
export async function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;

  // --- 1. 410 Gone Routes for Old SEO Cleanups ---
  const gonePaths = [
    '/us/ea-redeem-codes',
    '/ph/ea-fc-mobile-redeem-codes',
    '/in/fc-mobile-redeem-codes',
    '/fc-mobile-redeem-codes-today',
    '/vn/code-fc-mobile',
    '/vn/code-fc-mobile-vn',
    '/id/kode-redeem-fc-mobile',
    '/my/kod-redeem-fc-mobile',
    '/pt/codigo-de-resgate-fc-mobile',
    '/de/fc-mobile-einloesecodes',
    '/tr/fc-mobil-kullanim-kodlari',
    '/ru/fc-mobile-promo-code',
    '/my/fc-mobile-redeem-codes',
    '/es/codigos-de-canje-de-fc-mobile'
  ];
  
  if (gonePaths.includes(pathname) || pathname.startsWith('/blogs/redeem-codes/')) {
    return new NextResponse(null, { status: 410, statusText: 'Gone' });
  }

  // --- 2. Tool Redirects & Cleanup ---
  const toolParam = searchParams.get('tool');

  if (toolParam) {
    // Case A: Legacy root /tools?tool=...
    if (pathname === '/tools') {
      const tool = toolParam.toLowerCase();
      let destination = null;

      if (tool === 'squadbuilder' || tool === 'squad-builder') {
        destination = '/tools/squad-builder';
      } else if (tool === 'compare') {
        destination = '/tools/player-compare';
      } else if (tool === 'watchlist') {
        destination = '/tools/watchlist';
      }

      if (destination) {
        const url = request.nextUrl.clone();
        url.pathname = destination;
        url.search = ''; // Strip all query params
        return NextResponse.redirect(url, 301);
      }
    }

    // Case B: Cleanup /tools/clean-route?tool=...
    if (pathname.startsWith('/tools/')) {
      const url = request.nextUrl.clone();
      url.searchParams.delete('tool'); // Specifically remove 'tool' param
      // If no other params remain, clear search string entirely
      if (url.searchParams.toString() === '') {
        url.search = '';
      }
      return NextResponse.redirect(url, 301);
    }
  }

  // --- 2. Admin Authentication ---
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin') {
      return NextResponse.next();
    }

    const token = request.cookies.get(BLOG_ADMIN_SESSION_COOKIE_NAME)?.value;
    const session = await verifySignedBlogSessionToken(token, process.env);

    if (session) {
      return NextResponse.next();
    }

    const response = NextResponse.redirect(
      new URL(buildAdminLoginPath(`${pathname}${request.nextUrl.search || ''}`), request.url)
    );

    if (token) {
      response.cookies.set(BLOG_ADMIN_SESSION_COOKIE_NAME, '', {
        path: '/',
        maxAge: 0
      });
    }

    return response;
  }

  // --- 3. Global DB Redirects ---
  // Only process if it's a GET request and not an API or static route
  if (request.method === 'GET' && !pathname.startsWith('/api') && !pathname.startsWith('/_next') && !pathname.match(/\.[^/]+$/)) {
    try {
      // Fetch redirects from our internal API (which will be cached heavily by Next.js fetch cache)
      const baseUrl = request.nextUrl.origin;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout to prevent hanging

      let res;
      try {
        // Try local fetch first for speed (avoids public network loop)
        const port = process.env.PORT || 3000;
        res = await fetch(`http://127.0.0.1:${port}/api/internal/redirects`, {
          signal: controller.signal,
          headers: { host: request.nextUrl.host }
        });
      } catch (localErr) {
        // Fallback to public URL if local fails
        res = await fetch(`${baseUrl}/api/internal/redirects`, {
          signal: controller.signal,
        });
      }
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const redirectMap = await res.json();
        
        // Check if current pathname has a redirect
        if (redirectMap[pathname]) {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = redirectMap[pathname];
          // Preserve search params if any
          return NextResponse.redirect(redirectUrl, 301);
        }
      }
    } catch (e) {
      console.error('[middleware] Failed to fetch or process redirects:', e);
    }
  }

  // --- 4. Dynamic Last-Modified Header & 304 for Redeem Code Routes ---
  const cleanPath = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  if (request.method === 'GET' && REDEEM_CODE_PATHS.has(cleanPath)) {
    const lastModifiedDate = await getRedeemLastModifiedDate(cleanPath, request);
    if (lastModifiedDate) {
      const ifModifiedSince = request.headers.get('if-modified-since');
      if (ifModifiedSince) {
        const clientTime = new Date(ifModifiedSince).getTime();
        if (!Number.isNaN(clientTime) && Math.floor(clientTime / 1000) >= Math.floor(lastModifiedDate.getTime() / 1000)) {
          return new NextResponse(null, {
            status: 304,
            headers: {
              'Last-Modified': lastModifiedDate.toUTCString(),
              'Cache-Control': 'public, max-age=60, stale-while-revalidate=300'
            }
          });
        }
      }

      const response = NextResponse.next();
      response.headers.set('Last-Modified', lastModifiedDate.toUTCString());
      return response;
    }
  }

  return NextResponse.next();
}

const REDEEM_CODE_PATHS = new Set([
  '/fc-mobile-redeem-codes',
  '/th/fc-mobile-code',
  '/ae/kod-fifa',
  '/es/codigos-fc-mobile'

]);

async function getRedeemLastModifiedDate(cleanPath, request) {
  try {
    const port = process.env.PORT || 3000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);
    let res;
    try {
      res = await fetch(`http://127.0.0.1:${port}/api/internal/redeem-last-modified`, {
        signal: controller.signal,
        headers: { host: request.nextUrl.host }
      });
    } catch {
      res = await fetch(`${request.nextUrl.origin}/api/internal/redeem-last-modified`, {
        signal: controller.signal
      });
    }
    clearTimeout(timeoutId);
    if (res?.ok) {
      const data = await res.json();
      const rawDate = data?.[cleanPath] || data?.latest;
      if (rawDate) {
        const d = new Date(rawDate);
        if (!Number.isNaN(d.getTime())) return d;
      }
    }
  } catch (err) {
    // Non-blocking fallback
  }
  return null;
}

export const config = {
  // Broaden matcher to include tools, admin, and all general routes for global redirects
  // Excluding /api, /_next/static, /_next/image, favicon.ico, and common asset extensions
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|otf)$).*)']
};
