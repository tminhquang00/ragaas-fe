import React from 'react';
import {
    Box,
    CircularProgress,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import { AutoAwesome as LogoIcon } from '@mui/icons-material';

interface LoadingScreenProps {
    message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: theme.palette.background.default,
                gap: 4,
            }}
        >
            {/* Animated Logo */}
            <Box
                sx={{
                    position: 'relative',
                    '@keyframes pulse': {
                        '0%, 100%': {
                            transform: 'scale(1)',
                            boxShadow: `0 0 30px ${alpha(theme.palette.primary.main, 0.4)}`,
                        },
                        '50%': {
                            transform: 'scale(1.05)',
                            boxShadow: `0 0 50px ${alpha(theme.palette.primary.main, 0.6)}`,
                        },
                    },
                    animation: 'pulse 2s ease-in-out infinite',
                }}
            >
                <Box
                    sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <LogoIcon sx={{ color: 'white', fontSize: 48 }} />
                </Box>
            </Box>

            {/* Spinner */}
            <CircularProgress
                size={40}
                thickness={4}
                sx={{
                    color: theme.palette.primary.main,
                }}
            />

            {/* Message */}
            <Typography variant="body1" color="text.secondary">
                {message}
            </Typography>
        </Box>
    );
};
