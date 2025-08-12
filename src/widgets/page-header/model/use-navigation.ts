import { useTranslation } from '@/shared/contexts/translation-context';
import { useLocale } from '@/shared/contexts/locale-context';
import { BarChart3, History, Home, CreditCard } from 'lucide-react';

export function useNavigation() {
  const { t } = useTranslation();
  const { currentLocale } = useLocale();

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

  return { navItems, currentLocale };
}
