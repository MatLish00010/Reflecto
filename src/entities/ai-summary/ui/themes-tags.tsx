interface ThemesTagsProps {
  themes: string[];
}

export function ThemesTags({ themes }: ThemesTagsProps) {
  if (!themes || themes.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {themes.map((theme, index) => (
        <span
          key={index}
          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full"
        >
          #{theme}
        </span>
      ))}
    </div>
  );
}
