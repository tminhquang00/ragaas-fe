import React from 'react';
import {
    Tile,
    TextField as FrokTextField,
    Button,
    Toggle,
    Notification,
} from '@bosch/react-frok';
import { useAuth, useTheme as useAppTheme } from '../context';

export const SettingsPage: React.FC = () => {
    const { tenantId, setTenantId } = useAuth();
    const { mode, toggleTheme } = useAppTheme();
    const [localTenantId, setLocalTenantId] = React.useState(tenantId);

    const handleSaveTenant = () => {
        setTenantId(localTenantId);
    };

    return (
        <div>
            <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
                Settings
            </h4>
            <p style={{ color: 'var(--app-text-secondary)', marginBottom: '2rem' }}>
                Configure your application preferences
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 600 }}>
                {/* Tenant Configuration */}
                <Tile>
                    <h6 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                        Tenant Configuration
                    </h6>
                    <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                        Your tenant ID is used to identify your organization in API requests.
                    </p>

                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="tenant-id" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Tenant ID</label>
                        <FrokTextField
                            id="tenant-id"
                            value={localTenantId}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalTenantId(e.target.value)}
                        />
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <Button
                            mode="primary"
                            onClick={handleSaveTenant}
                            disabled={localTenantId === tenantId}
                        >
                            Save Tenant ID
                        </Button>
                    </div>
                </Tile>

                {/* Theme Settings */}
                <Tile>
                    <h6 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                        Appearance
                    </h6>
                    <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                        Customize the look and feel of the application.
                    </p>

                    <Toggle
                        id="dark-mode-toggle"
                        leftLabel="Dark Mode"
                        checked={mode === 'dark'}
                        onChange={toggleTheme}
                    />
                </Tile>

                {/* API Configuration */}
                <Tile>
                    <h6 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                        API Configuration
                    </h6>
                    <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                        Backend API connection settings.
                    </p>

                    <Notification type="neutral" icon="alert-info" defaultOpen>
                        API URL: <code>{import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}</code>
                    </Notification>

                    <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.75rem', marginTop: '0.75rem' }}>
                        To change the API URL, set the <code>VITE_API_BASE_URL</code> environment variable.
                    </p>
                </Tile>

                {/* Azure AD Settings */}
                <Tile>
                    <h6 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                        Authentication
                    </h6>
                    <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                        Azure AD authentication settings.
                    </p>

                    <Notification type="neutral" icon="alert-info" defaultOpen>
                        Azure AD is currently {import.meta.env.VITE_USE_AZURE_AD === 'true' ? 'enabled' : 'disabled'}.
                        Set <code>VITE_USE_AZURE_AD=true</code> to enable Azure AD authentication.
                    </Notification>
                </Tile>
            </div>
        </div>
    );
};
