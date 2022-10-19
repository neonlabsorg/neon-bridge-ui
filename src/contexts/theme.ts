import { useEffect, useState } from 'react';

export type ThemeType = 'light' | 'dark';
const isBrowserDefaultDark = (): boolean => window.matchMedia('(prefers-color-scheme: dark)').matches;

export function useTheme(): [ThemeType, () => void] {
  const getDefaultTheme = (): ThemeType => {
    const localStorageTheme = localStorage.getItem('theme') as ThemeType;
    const browserDefault: ThemeType = isBrowserDefaultDark() ? 'dark' : 'light';
    return localStorageTheme || browserDefault;
  };
  const [theme, setTheme] = useState<ThemeType>(getDefaultTheme());

  const handleThemeChange = () => {
    const isCurrentDark = theme === 'dark';
    setTheme(isCurrentDark ? 'light' : 'dark');
    localStorage.setItem('theme', isCurrentDark ? 'light' : 'dark');
  };

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  return [theme, handleThemeChange];
}
