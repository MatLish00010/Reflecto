'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { Menu, X } from '@/shared/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { safeSentry } from '@/shared/lib/sentry';
import type { Span } from '@sentry/nextjs';
import { FeedbackButton } from '@/features/feedback';
import { MobileLanguageToggle } from '@/features/language-toggle';
import { MobileThemeToggle } from '@/features/theme-toggle';
import { useNavigation } from '../model/use-navigation';
import { useTranslation } from '@/shared/contexts/translation-context';
import { useLocale } from '@/shared/contexts/locale-context';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { currentLocale } = useLocale();
  const { navItems } = useNavigation();
  const pathname = usePathname();

  const handleItemClick = () => {
    safeSentry.startSpan(
      {
        op: 'ui.click',
        name: 'Mobile Menu Item Click',
      },
      (span: Span) => {
        span.setAttribute('action', 'close_menu');
        setIsOpen(false);
      }
    );
  };

  const handleMenuToggle = (open: boolean) => {
    safeSentry.startSpan(
      {
        op: 'ui.click',
        name: 'Mobile Menu Toggle',
      },
      (span: Span) => {
        span.setAttribute('action', open ? 'open_menu' : 'close_menu');
        setIsOpen(open);
      }
    );
  };

  return (
    <>
      <motion.div
        className="md:hidden"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleMenuToggle(true)}
          aria-label={t('navigation.openMenu')}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Overlay */}
            <motion.div
              className="absolute inset-0 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                safeSentry.startSpan(
                  {
                    op: 'ui.click',
                    name: 'Mobile Menu Overlay Click',
                  },
                  (span: Span) => {
                    span.setAttribute('action', 'close_menu_overlay');
                    setIsOpen(false);
                  }
                );
              }}
            />

            {/* Menu */}
            <motion.div
              id="mobile-menu"
              className="absolute inset-y-0 left-0 w-3/4 bg-background border-r shadow-lg"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{
                type: 'tween',
                ease: 'easeInOut',
                duration: 0.3,
              }}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <motion.div
                  className="flex items-center justify-between p-4 border-b"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                >
                  <h2 className="font-semibold">{t('navigation.menu')}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      safeSentry.startSpan(
                        {
                          op: 'ui.click',
                          name: 'Mobile Menu Close Button Click',
                        },
                        (span: Span) => {
                          span.setAttribute('action', 'close_menu_button');
                          setIsOpen(false);
                        }
                      );
                    }}
                    className="p-1"
                    aria-label={t('navigation.closeMenu')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>

                {/* Content */}
                <div className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto">
                  <nav className="flex flex-col gap-2">
                    {navItems.map((item, index) => {
                      const Icon = item.icon;
                      const isActive =
                        pathname === item.href ||
                        (item.href.endsWith(`/${currentLocale}`) &&
                          pathname === `/${currentLocale}`);

                      return (
                        <motion.div
                          key={item.href}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: 0.2 + index * 0.05,
                            duration: 0.2,
                          }}
                        >
                          <Link href={item.href} onClick={handleItemClick}>
                            <Button
                              variant={isActive ? 'default' : 'outline'}
                              className="w-full justify-start"
                            >
                              <Icon className="h-4 w-4 mr-3" />
                              {item.label}
                            </Button>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </nav>

                  <motion.div
                    className="border-t pt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.2 }}
                  >
                    <div className="flex flex-col gap-2">
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.45, duration: 0.2 }}
                      >
                        <FeedbackButton variant="mobile" />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.2 }}
                      >
                        <MobileLanguageToggle />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.55, duration: 0.2 }}
                      >
                        <MobileThemeToggle />
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
