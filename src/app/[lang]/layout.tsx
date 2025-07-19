import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from '@/shared/providers/theme-provider';
import { AlertProvider } from '@/shared/providers/alert-provider';
import { TranslationProvider } from '@/shared/contexts/translation-context';
import { QueryProvider } from '@/shared/providers/query-provider';
import { PageHeader } from '@/widgets/page-header';
import { getDictionary } from '@/shared/dictionaries';

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
  return [
    { lang: 'en' },
    { lang: 'ru' },
    { lang: 'de' },
    { lang: 'fr' },
    { lang: 'es' },
    { lang: 'it' },
    { lang: 'pt' },
    { lang: 'ja' },
    { lang: 'ko' },
    { lang: 'zh' },
  ];
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
            <QueryProvider>
              <AlertProvider>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
                  <div className="max-w-4xl mx-auto">
                    <PageHeader dict={dict} />
                    {children}
                  </div>
                </div>
              </AlertProvider>
            </QueryProvider>
          </TranslationProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}
