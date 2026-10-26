import { useI18n } from '@affine/i18n';
import { useTheme } from 'next-themes';

import * as styles from './styles.css';

export const ThemeSwitch = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useI18n();

  return (
    <div
      className={styles.root}
      role="group"
      aria-label={t['com.affine.appearanceSettings.theme.title']()}
    >
      <button
        type="button"
        className={styles.option}
        aria-pressed={resolvedTheme === 'light'}
        onClick={() => setTheme('light')}
        data-testid="nexo-light-theme"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2V4M12 20V22M2 12H4M20 12H22M5 5L6.5 6.5M17.5 17.5L19 19M5 19L6.5 17.5M17.5 6.5L19 5" />
        </svg>
        {t['com.affine.themeSettings.light']()}
      </button>
      <button
        type="button"
        className={styles.option}
        aria-pressed={resolvedTheme === 'dark'}
        onClick={() => setTheme('dark')}
        data-testid="nexo-dark-theme"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20.5 14A8.7 8.7 0 0 1 10 3.5 8.7 8.7 0 1 0 20.5 14Z" />
        </svg>
        {t['com.affine.themeSettings.dark']()}
      </button>
    </div>
  );
};
