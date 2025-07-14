import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserInfoDropdown } from '@/components/page-header/user-info-dropdown';
import { translate } from '@/lib/utils';

interface PageHeaderProps {
  dict: Record<string, unknown>;
}

export function PageHeader({ dict }: PageHeaderProps) {
  return (
    <header className="pb-8">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <UserInfoDropdown />
        </div>
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {translate(dict, 'app.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {translate(dict, 'app.description')}
        </p>
      </div>
    </header>
  );
}
