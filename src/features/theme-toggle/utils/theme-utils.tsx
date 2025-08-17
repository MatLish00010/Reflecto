import { useTheme } from 'next-themes';
import { Moon, Sun } from '@/shared/icons';

export function useThemeUtils() {
  const { setTheme, theme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  return {
    setTheme,
    theme,
    getThemeIcon,
  };
}
