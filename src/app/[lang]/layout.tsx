import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from '@/shared/providers/theme-provider';
import { AlertProvider } from '@/shared/providers/alert-provider';
import { TranslationProvider } from '@/shared/contexts/translation-context';
import { LocaleProvider } from '@/shared/contexts/locale-context';
import { AuthModalProvider } from '@/shared/contexts/auth-modal-context';
import { UserProvider } from '@/shared/contexts/user-context';
import { QueryProvider } from '@/shared/providers/query-provider';
import { PageHeader } from '@/widgets/page-header';
import { AuthModalWrapper } from '@/widgets/auth-modal-wrapper';
import { getDictionary } from '@/shared/dictionaries';
import { OnboardingGuide } from '@/features';
import { SUPPORTED_LOCALES } from '@/shared/lib/language-detector';
import { getServerUser } from '@/shared/lib/server-auth';
import { AuthSync, QueryErrorHandler } from '@/shared/components';

import '../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map(lang => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return {
    title: dict.app.title,
    description: dict.app.description,
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const { user, isSubscribed } = await getServerUser();

  return (
    <html lang={lang} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TranslationProvider dict={dict} lang={lang}>
            <LocaleProvider initialLocale={lang}>
              <QueryProvider>
                <AlertProvider>
                  <AuthModalProvider>
                    <UserProvider
                      initialUser={user}
                      isSubscribed={isSubscribed}
                    >
                      <QueryErrorHandler />
                      <AuthSync />
                      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
                        <div className="max-w-4xl mx-auto">
                          <PageHeader />
                          <OnboardingGuide />
                          {children}
                        </div>
                      </div>
                      <AuthModalWrapper />
                    </UserProvider>
                  </AuthModalProvider>
                </AlertProvider>
              </QueryProvider>
            </LocaleProvider>
          </TranslationProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}
