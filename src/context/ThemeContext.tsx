import React, { createContext, useContext, ReactNode } from 'react';
import { useFrokTheme } from '../utils/frokTheme';

type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
    mode: ThemeMode;
    toggleTheme: () => void;
    setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { mode, toggleTheme } = useFrokTheme();

    const handleSetMode = (newMode: ThemeMode) => {
        if (newMode !== mode) {
            toggleTheme();
        }
    };

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme, setMode: handleSetMode }}>
            {children}
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
