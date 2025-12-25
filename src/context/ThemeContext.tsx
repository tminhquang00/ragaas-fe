import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { darkTheme, lightTheme } from '../theme';

type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
    mode: ThemeMode;
    toggleTheme: () => void;
    setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem('ragaas_theme');
        return (saved as ThemeMode) || 'dark';
    });

    const toggleTheme = () => {
        setMode((prev) => {
            const newMode = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem('ragaas_theme', newMode);
            return newMode;
        });
    };

    const handleSetMode = (newMode: ThemeMode) => {
        setMode(newMode);
        localStorage.setItem('ragaas_theme', newMode);
    };

    const theme = useMemo(() => (mode === 'dark' ? darkTheme : lightTheme), [mode]);

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme, setMode: handleSetMode }}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
