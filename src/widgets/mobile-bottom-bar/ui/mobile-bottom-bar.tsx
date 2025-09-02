'use client';

import { Archive, BarChart3, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/shared/client/contexts/translation-context';
import { cn } from '@/shared/common/lib/utils';

export function MobileBottomBar() {
  const { t, lang } = useTranslation();
  const pathname = usePathname();

  const navigationItems = [
    {
      icon: Home,
      label: t('navigation.home'),
      href: `/${lang}`,
      isActive: pathname === `/${lang}` || pathname === `/${lang}/`,
    },
    {
      icon: Archive,
      label: t('navigation.history'),
      href: `/${lang}/history`,
      isActive: pathname.startsWith(`/${lang}/history`),
    },
    {
      icon: BarChart3,
      label: t('navigation.analytics'),
      href: `/${lang}/analytics`,
      isActive: pathname.startsWith(`/${lang}/analytics`),
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border md:hidden">
      <div className="flex items-center justify-around py-2">
        {navigationItems.map(item => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full py-2 transition-colors duration-200',
                item.isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
