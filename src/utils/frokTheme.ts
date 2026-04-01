import { useState, useEffect, useCallback } from 'react';

const THEME_KEY = 'ragaas_theme';

export function useFrokTheme() {
    const [mode, setMode] = useState<'light' | 'dark'>(() => {
        const saved = localStorage.getItem(THEME_KEY);
        return saved === 'light' ? 'light' : 'dark';
    });

    const isDark = mode === 'dark';

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('-dark-mode');
        } else {
            document.documentElement.classList.remove('-dark-mode');
        }
    }, [isDark]);

    const toggleTheme = useCallback(() => {
        setMode((prev) => {
            const next = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem(THEME_KEY, next);
            return next;
        });
    }, []);

    return { mode, toggleTheme, isDark };
}

/** Returns a CSS `var()` reference, e.g. `cssVar('--g-blue-50')` → `'var(--g-blue-50)'` */
export function cssVar(name: string): string {
    return `var(${name})`;
}

/** Drop-in replacement for MUI's `alpha()` using CSS `color-mix()` */
export function alpha(color: string, opacity: number): string {
    return `color-mix(in srgb, ${color} ${Math.round(opacity * 100)}%, transparent)`;
}
