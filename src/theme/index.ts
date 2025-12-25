import { createTheme, alpha, ThemeOptions } from '@mui/material/styles';

// Color palette with vibrant modern colors
const palette = {
    primary: {
        main: '#6366f1', // Indigo
        light: '#818cf8',
        dark: '#4f46e5',
        contrastText: '#ffffff',
    },
    secondary: {
        main: '#ec4899', // Pink
        light: '#f472b6',
        dark: '#db2777',
        contrastText: '#ffffff',
    },
    success: {
        main: '#10b981', // Emerald
        light: '#34d399',
        dark: '#059669',
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
        main: '#3b82f6', // Blue
        light: '#60a5fa',
        dark: '#2563eb',
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
        divider: alpha('#6366f1', 0.12),
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
        borderRadius: 12,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#6366f1 #1a1a2e',
                    '&::-webkit-scrollbar': {
                        width: '8px',
                        height: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: '#1a1a2e',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: '#6366f1',
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: '#818cf8',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: '10px 24px',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${alpha('#6366f1', 0.3)}`,
                    },
                },
                contained: {
                    background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${palette.primary.dark} 100%)`,
                    '&:hover': {
                        background: `linear-gradient(135deg, ${palette.primary.light} 0%, ${palette.primary.main} 100%)`,
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    background: alpha('#1a1a2e', 0.8),
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha('#6366f1', 0.15)}`,
                    boxShadow: `0 8px 32px ${alpha('#000', 0.3)}`,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        border: `1px solid ${alpha('#6366f1', 0.3)}`,
                        boxShadow: `0 12px 40px ${alpha('#6366f1', 0.15)}`,
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation1: {
                    background: alpha('#1a1a2e', 0.9),
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha('#6366f1', 0.1)}`,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        background: alpha('#0f0f23', 0.5),
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            background: alpha('#0f0f23', 0.8),
                        },
                        '&.Mui-focused': {
                            background: alpha('#0f0f23', 0.8),
                            boxShadow: `0 0 0 3px ${alpha('#6366f1', 0.2)}`,
                        },
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 500,
                },
                filled: {
                    background: alpha('#6366f1', 0.15),
                    '&:hover': {
                        background: alpha('#6366f1', 0.25),
                    },
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    background: alpha('#1a1a2e', 0.95),
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha('#6366f1', 0.2)}`,
                    boxShadow: `0 25px 50px ${alpha('#000', 0.5)}`,
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    background: alpha('#0f0f23', 0.95),
                    backdropFilter: 'blur(20px)',
                    borderRight: `1px solid ${alpha('#6366f1', 0.1)}`,
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: alpha('#0f0f23', 0.8),
                    backdropFilter: 'blur(20px)',
                    borderBottom: `1px solid ${alpha('#6366f1', 0.1)}`,
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
                    borderRadius: 3,
                    background: `linear-gradient(90deg, ${palette.primary.main}, ${palette.secondary.main})`,
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                    height: 6,
                    background: alpha('#6366f1', 0.1),
                },
                bar: {
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${palette.primary.main}, ${palette.secondary.main})`,
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    background: alpha('#1a1a2e', 0.95),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha('#6366f1', 0.2)}`,
                    borderRadius: 8,
                    fontSize: '0.875rem',
                    padding: '8px 12px',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    margin: '2px 8px',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        background: alpha('#6366f1', 0.1),
                    },
                    '&.Mui-selected': {
                        background: alpha('#6366f1', 0.15),
                        '&:hover': {
                            background: alpha('#6366f1', 0.2),
                        },
                    },
                },
            },
        },
        MuiAvatar: {
            styleOverrides: {
                root: {
                    background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${palette.secondary.main} 100%)`,
                },
            },
        },
        MuiFab: {
            styleOverrides: {
                root: {
                    background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${palette.primary.dark} 100%)`,
                    boxShadow: `0 8px 25px ${alpha('#6366f1', 0.4)}`,
                    '&:hover': {
                        background: `linear-gradient(135deg, ${palette.primary.light} 0%, ${palette.primary.main} 100%)`,
                        boxShadow: `0 12px 35px ${alpha('#6366f1', 0.5)}`,
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
            default: '#f8fafc',
            paper: '#ffffff',
        },
        text: {
            primary: '#1e293b',
            secondary: '#64748b',
        },
        divider: alpha('#6366f1', 0.1),
    },
    typography: darkThemeOptions.typography,
    shape: darkThemeOptions.shape,
    components: {
        ...darkThemeOptions.components,
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#6366f1 #e2e8f0',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    background: '#ffffff',
                    border: `1px solid ${alpha('#6366f1', 0.1)}`,
                    boxShadow: `0 4px 20px ${alpha('#6366f1', 0.08)}`,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        border: `1px solid ${alpha('#6366f1', 0.2)}`,
                        boxShadow: `0 8px 30px ${alpha('#6366f1', 0.12)}`,
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation1: {
                    background: '#ffffff',
                    border: `1px solid ${alpha('#6366f1', 0.08)}`,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        background: '#ffffff',
                        '&:hover': {
                            background: '#f8fafc',
                        },
                        '&.Mui-focused': {
                            background: '#ffffff',
                            boxShadow: `0 0 0 3px ${alpha('#6366f1', 0.15)}`,
                        },
                    },
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    background: '#ffffff',
                    borderRight: `1px solid ${alpha('#6366f1', 0.1)}`,
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: alpha('#ffffff', 0.9),
                    backdropFilter: 'blur(20px)',
                    borderBottom: `1px solid ${alpha('#6366f1', 0.1)}`,
                    boxShadow: 'none',
                    color: '#1e293b',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    background: '#ffffff',
                    border: `1px solid ${alpha('#6366f1', 0.15)}`,
                    boxShadow: `0 25px 50px ${alpha('#6366f1', 0.15)}`,
                },
            },
        },
    },
};

export const darkTheme = createTheme(darkThemeOptions);
export const lightTheme = createTheme(lightThemeOptions);
