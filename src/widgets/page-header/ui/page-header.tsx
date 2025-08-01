import { LanguageToggle } from '@/features/language-toggle';
import { ThemeToggle } from '@/features/theme-toggle';
import { UserInfoDropdown } from './user-info-dropdown';
import { FeedbackButton } from '@/features/feedback';
import { Navigation } from './navigation';

export function PageHeader() {
  return (
    <header className="pb-8">
      <div className="flex justify-between items-start">
        <Navigation />
        <div className="flex items-center gap-2">
          <FeedbackButton />
          <LanguageToggle />
          <ThemeToggle />
          <UserInfoDropdown />
        </div>
      </div>
    </header>
  );
}
