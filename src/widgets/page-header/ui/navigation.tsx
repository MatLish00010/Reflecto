'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/shared/client/ui/button';
import { useNavigation } from '../model/use-navigation';

export function Navigation() {
  const { navItems, currentLocale } = useNavigation();
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-2 mb-6">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href.endsWith(`/${currentLocale}`) &&
            pathname === `/${currentLocale}`);

        return (
          <Button
            key={item.href}
            asChild
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            className="flex items-center gap-2"
          >
            <Link href={item.href}>
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
