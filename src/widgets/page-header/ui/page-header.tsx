import { FeedbackButton } from '@/features/feedback';
import { LanguageToggle } from '@/features/language-toggle';
import { ThemeToggle } from '@/features/theme-toggle';
import { MobileMenuButton } from './mobile-menu';
import { MobileUserInfo } from './mobile-user-info';
import { Navigation } from './navigation';
import { UserInfoDropdown } from './user-info-dropdown';

export function PageHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start flex-wrap">
          <div className="flex items-center gap-2">
            <Navigation />
            <div className="md:hidden">
              <MobileMenuButton />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <FeedbackButton />
              <LanguageToggle />
              <ThemeToggle />
              <UserInfoDropdown />
            </div>
            <div className="md:hidden">
              <MobileUserInfo />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
