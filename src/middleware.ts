import { NextResponse } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

const locales = ['en', 'ru'];
const defaultLocale = 'ru';

// Get the preferred locale
function getLocale(request: Request): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  return match(languages, locales, defaultLocale);
}

export function middleware(request: Request) {
  const pathname = new URL(request.url).pathname;

  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If no locale, redirect to add locale
  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    const newUrl = new URL(request.url);
    newUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(newUrl);
  }

  // Extract locale from pathname
  const pathnameSegments = pathname.split('/');
  const locale = pathnameSegments[1];

  // Skip auth check for API routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check for user authentication via httpOnly cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const userIdMatch = cookieHeader.match(/userId=([^;]+)/);
  const userId = userIdMatch ? userIdMatch[1] : null;

  // If user is authenticated and trying to access login page, redirect to home
  if (userId && pathname.includes('/login')) {
    const homeUrl = new URL(request.url);
    homeUrl.pathname = `/${locale}`;
    return NextResponse.redirect(homeUrl);
  }

  // If no user ID and not on login page, redirect to login
  if (!userId && !pathname.includes('/login')) {
    const loginUrl = new URL(request.url);
    loginUrl.pathname = `/${locale}/login`;
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|_vercel|.*\\..*).*)',
  ],
};
