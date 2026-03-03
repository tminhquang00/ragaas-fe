import { createTheme, alpha, ThemeOptions } from '@mui/material/styles';

// Color palette using BDDS (Bosch Digital Design System) colors
const palette = {
    primary: {
        main: '#007bc0', // Bosch Accent (g-blue-50)
        light: '#3395cc',
        dark: '#005686',
        contrastText: '#ffffff',
    },
    secondary: {
        main: '#9e2896', // Bosch Emphasis 03 (g-purple-40)
        light: '#b153ab',
        dark: '#6e1c69',
        contrastText: '#ffffff',
    },
    success: {
        main: '#00884a', // Bosch Emphasis 02 (g-green-50)
        light: '#33a06e',
        dark: '#005f33',
    },
    warning: {
        main: '#f59e0b', // Amber
        light: '#fbbf24',
        dark: '#d97706',
    },
    error: {
        main: '#ef4444', // Red
        light: '#f87171',
        dark: '#dc2626',
    },
    info: {
        main: '#18837e', // Bosch Emphasis 04 (g-turquoise-50)
        light: '#469b98',
        dark: '#105b58',
    },
};

const darkThemeOptions: ThemeOptions = {
    palette: {
        mode: 'dark',
        ...palette,
        background: {
            default: '#0f0f23',
            paper: '#1a1a2e',
        },
        text: {
            primary: '#f1f5f9',
            secondary: '#94a3b8',
        },
        divider: alpha('#007bc0', 0.12),
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
        },
        h2: {
            fontWeight: 700,
            letterSpacing: '-0.01em',
        },
        h3: {
            fontWeight: 600,
            letterSpacing: '-0.01em',
        },
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 0,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#007bc0 #1a1a2e',
                    '&::-webkit-scrollbar': {
                        width: '8px',
                        height: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: '#1a1a2e',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: '#007bc0',
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: '#3395cc',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    padding: '10px 24px',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'none',
                        boxShadow: 'none',
                    },
                },
                contained: {
                    background: palette.primary.main,
                    '&:hover': {
                        background: palette.primary.dark,
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    background: '#1a1a2e',
                    border: `1px solid ${alpha('#007bc0', 0.5)}`,
                    boxShadow: 'none',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        border: `1px solid ${palette.primary.main}`,
                        boxShadow: 'none',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    borderRadius: 0,
                },
                elevation1: {
                    background: '#1a1a2e',
                    border: `1px solid ${alpha('#007bc0', 0.1)}`,
                    boxShadow: 'none',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        background: '#0f0f23',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            background: '#14142d',
                        },
                        '&.Mui-focused': {
                            background: '#14142d',
                            boxShadow: `0 0 0 2px ${palette.primary.main}`,
                        },
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    fontWeight: 500,
                },
                filled: {
                    background: alpha('#007bc0', 0.15),
                    '&:hover': {
                        background: alpha('#007bc0', 0.25),
                    },
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 0,
                    background: '#1a1a2e',
                    border: `1px solid ${palette.primary.main}`,
                    boxShadow: `0 4px 20px ${alpha('#000', 0.5)}`,
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderRadius: 0,
                    background: '#0f0f23',
                    borderRight: `1px solid ${alpha('#007bc0', 0.2)}`,
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: '#0f0f23',
                    borderBottom: `1px solid ${alpha('#007bc0', 0.2)}`,
                    boxShadow: 'none',
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    minHeight: 48,
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                indicator: {
                    height: 3,
                    borderRadius: 0,
                    background: palette.primary.main,
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    height: 6,
                    background: alpha('#007bc0', 0.1),
                },
                bar: {
                    borderRadius: 0,
                    background: palette.primary.main,
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    borderRadius: 0,
                    background: '#1a1a2e',
                    border: `1px solid ${alpha('#007bc0', 0.5)}`,
                    fontSize: '0.875rem',
                    padding: '8px 12px',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    margin: '2px 8px',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        background: alpha('#007bc0', 0.1),
                    },
                    '&.Mui-selected': {
                        background: alpha('#007bc0', 0.15),
                        '&:hover': {
                            background: alpha('#007bc0', 0.2),
                        },
                    },
                },
            },
        },
        MuiAvatar: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    background: palette.primary.main,
                },
            },
        },
        MuiFab: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    background: palette.primary.main,
                    boxShadow: 'none',
                    '&:hover': {
                        background: palette.primary.dark,
                        boxShadow: 'none',
                    },
                },
            },
        },
    },
};

const lightThemeOptions: ThemeOptions = {
    palette: {
        mode: 'light',
        ...palette,
        background: {
            default: '#eef0f2', // Bosch light gray background — contrasts clearly with white cards
            paper: '#ffffff',
        },
        text: {
            primary: '#1c2026', // Near-black for maximum readability
            secondary: '#525a65',
        },
        divider: '#d0d4d9', // Visible neutral gray divider
    },
    typography: darkThemeOptions.typography,
    shape: darkThemeOptions.shape,
    components: {
        ...darkThemeOptions.components,
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#007bc0 #e2e8f0',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    background: '#ffffff',
                    border: '1px solid #bfc4ca', // Strong, visible gray border
                    boxShadow: 'none',
                    transition: 'border-color 0.2s ease-in-out',
                    '&:hover': {
                        border: `1px solid ${palette.primary.main}`,
                        boxShadow: 'none',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    borderRadius: 0,
                },
                elevation1: {
                    background: '#ffffff',
                    border: '1px solid #d0d4d9',
                    boxShadow: 'none',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        background: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#bfc4ca',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8a9099',
                        },
                        '&.Mui-focused': {
                            background: '#ffffff',
                            boxShadow: `0 0 0 2px ${palette.primary.main}`,
                        },
                    },
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderRadius: 0,
                    background: '#f5f6f7', // Slightly off-white sidebar
                    borderRight: '1px solid #d0d4d9',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: '#ffffff',
                    borderBottom: '1px solid #d0d4d9',
                    boxShadow: 'none',
                    color: '#1c2026',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 0,
                    background: '#ffffff',
                    border: `2px solid ${palette.primary.main}`,
                    boxShadow: `0 4px 20px ${alpha('#000', 0.15)}`,
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    fontWeight: 600,
                },
                filled: {
                    background: alpha('#007bc0', 0.12),
                    color: '#005686',
                    '&:hover': {
                        background: alpha('#007bc0', 0.22),
                    },
                },
                outlined: {
                    borderColor: '#bfc4ca',
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    borderRadius: 0,
                    background: '#1c2026',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.8rem',
                    padding: '6px 10px',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    margin: '2px 8px',
                    transition: 'all 0.15s ease-in-out',
                    '&:hover': {
                        background: '#e4e7ea',
                    },
                    '&.Mui-selected': {
                        background: alpha('#007bc0', 0.12),
                        borderLeft: `3px solid ${palette.primary.main}`,
                        '&:hover': {
                            background: alpha('#007bc0', 0.18),
                        },
                    },
                },
            },
        },
    },
};

export const darkTheme = createTheme(darkThemeOptions);
export const lightTheme = createTheme(lightThemeOptions);
