'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/shared/contexts/translation-context';
import { useLocale } from '@/shared/contexts/locale-context';
import { Button } from '@/shared/ui/button';
import { BarChart3, History, Home, CreditCard, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/ui/sheet';
import { UserInfoDropdown } from './user-info-dropdown';
import { FeedbackButton } from '@/features/feedback';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
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
    {
      href: `/${currentLocale}/subscriptions`,
      label: t('navigation.subscriptions'),
      icon: CreditCard,
    },
  ];

  const handleItemClick = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle>{t('navigation.menu')}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-6 px-4">
          <nav className="flex flex-col gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href.endsWith(`/${currentLocale}`) &&
                  pathname === `/${currentLocale}`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleItemClick}
                >
                  <Button
                    variant={isActive ? 'default' : 'outline'}
                    className="w-full justify-start"
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
          <div className="border-t pt-4">
            <div className="flex flex-col gap-2">
              <FeedbackButton />
              <UserInfoDropdown />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
