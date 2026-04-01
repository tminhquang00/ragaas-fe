import React from 'react';
import { ActivityIndicator } from '@bosch/react-frok';
import { FrokIcon } from '../../utils/iconAdapter';

interface LoadingScreenProps {
    message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
    return (
        <>
            <style>{`
                @keyframes loading-pulse {
                    0%, 100% {
                        transform: scale(1);
                        box-shadow: 0 0 30px color-mix(in srgb, var(--app-primary) 40%, transparent);
                    }
                    50% {
                        transform: scale(1.05);
                        box-shadow: 0 0 50px color-mix(in srgb, var(--app-primary) 60%, transparent);
                    }
                }
            `}</style>
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--app-bg)',
                    gap: '2rem',
                }}
            >
                {/* Animated Logo */}
                <div
                    style={{
                        position: 'relative',
                        animation: 'loading-pulse 2s ease-in-out infinite',
                    }}
                >
                    <div
                        style={{
                            width: 80,
                            height: 80,
                            background: 'var(--app-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <FrokIcon name="AutoAwesome" style={{ color: 'white', fontSize: 48 }} />
                    </div>
                </div>

                {/* Spinner */}
                <ActivityIndicator size="large" />

                {/* Message */}
                <p style={{ color: 'var(--app-text-secondary)' }}>
                    {message}
                </p>
            </div>
        </>
    );
};
