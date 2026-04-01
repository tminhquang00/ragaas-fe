/**
 * Theme configuration — FROK migration
 *
 * MUI theme objects have been removed. Color tokens and theming are now handled by:
 *   - src/styles/frok-overrides.css  (CSS custom properties)
 *   - src/utils/frokTheme.ts         (useFrokTheme hook, alpha helper)
 *   - FROK design tokens (@bosch/bdds.tokens-npm)
 *
 * This file is kept for backward-compat with any remaining MUI-consuming components
 * that still import from '../theme'. It will be deleted once the full migration is complete.
 */

/** BDDS color palette — plain values for components that haven't migrated yet */
export const palette = {
    primary: {
        main: '#007bc0',
        light: '#3395cc',
        dark: '#005686',
        contrastText: '#ffffff',
    },
    secondary: {
        main: '#9e2896',
        light: '#b153ab',
        dark: '#6e1c69',
        contrastText: '#ffffff',
    },
    success: { main: '#00884a' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    info: { main: '#18837e' },
};
