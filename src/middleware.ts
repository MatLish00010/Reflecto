import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { NextResponse } from 'next/server';
import { APP_CONSTANTS } from '@/shared/common/config';

const locales = APP_CONSTANTS.SUPPORTED_LOCALES;

// Get the preferred locale
function getLocale(request: Request): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    negotiatorHeaders[key] = value;
  });

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  return match(languages, locales, APP_CONSTANTS.DEFAULT_LOCALE);
}

export async function middleware(request: Request) {
  const pathname = new URL(request.url).pathname;

  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    const newUrl = new URL(request.url);
    newUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(newUrl);
  }

  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/monitoring') ||
    pathname.startsWith('/auth/callback')
  ) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - monitoring (Sentry tunnel route)
     * - auth/callback (OAuth callback route - should work without locale)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!api|monitoring|auth/callback|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
