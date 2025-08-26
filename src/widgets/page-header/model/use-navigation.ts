import { useLocale } from '@/shared/client/contexts/locale-context';
import { useTranslation } from '@/shared/client/contexts/translation-context';
import { BarChart3, CreditCard, History, Home } from '@/shared/client/icons';

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
