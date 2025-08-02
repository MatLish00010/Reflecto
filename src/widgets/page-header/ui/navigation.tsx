'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/shared/contexts/translation-context';
import { useLocale } from '@/shared/contexts/locale-context';
import { Button } from '@/shared/ui/button';
import { BarChart3, History, Home } from 'lucide-react';

export function Navigation() {
  const { t } = useTranslation();
  const { currentLocale } = useLocale();
  const pathname = usePathname();

  const navItems = [
    {
      href: `/${currentLocale}`,
      label: t('navigation.home'),
      icon: Home,
    },
    {
      href: `/${currentLocale}/history`,
      label: t('navigation.history'),
      icon: History,
    },
    {
      href: `/${currentLocale}/analytics`,
      label: t('navigation.analytics'),
      icon: BarChart3,
    },
  ];

  return (
    <nav className="flex items-center gap-2 mb-6">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href.endsWith(`/${currentLocale}`) &&
            pathname === `/${currentLocale}`);

        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}
