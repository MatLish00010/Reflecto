import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AlertProvider } from '@/components/alert-provider';
import { TranslationProvider } from '@/contexts/translation-context';
import { UserProvider } from '@/contexts/user-context';
import { PageHeader } from '@/components/page-header';
import { getDictionary } from '@/dictionaries';

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
  return [{ lang: 'en' }, { lang: 'ru' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: 'en' | 'ru' }>;
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
  params: Promise<{ lang: 'en' | 'ru' }>;
}>) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

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
          <TranslationProvider dict={dict}>
            <UserProvider>
              <AlertProvider>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
                  <div className="max-w-4xl mx-auto">
                    <PageHeader />
                    {children}
                  </div>
                </div>
              </AlertProvider>
            </UserProvider>
          </TranslationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
