import { NextResponse } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { createServerClient } from '@supabase/ssr';

const locales = ['en', 'ru'];
const defaultLocale = 'ru';

// Get the preferred locale
function getLocale(request: Request): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  return match(languages, locales, defaultLocale);
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

  const pathnameSegments = pathname.split('/');
  const locale = pathnameSegments[1];

  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return (
            request.headers
              .get('cookie')
              ?.split(';')
              .map(cookie => {
                const [name, value] = cookie.trim().split('=');
                return { name, value };
              }) || []
          );
        },
        setAll() {
          // This is handled by the response
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && pathname.includes('/login')) {
    const homeUrl = new URL(request.url);
    homeUrl.pathname = `/${locale}`;
    return NextResponse.redirect(homeUrl);
  }

  if (!user && !pathname.includes('/login')) {
    const loginUrl = new URL(request.url);
    loginUrl.pathname = `/${locale}/login`;
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
