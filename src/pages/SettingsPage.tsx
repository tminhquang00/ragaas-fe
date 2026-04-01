import React from 'react';
import {
    Tile,
    TextField as FrokTextField,
    Button,
    Toggle,
    Notification,
    Layout,
    Divider,
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
        <Layout>
            <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', marginTop: 0 }}>
                    Settings
                </h4>
                <p style={{ color: 'var(--app-text-secondary)', marginBottom: 0 }}>
                    Configure your application preferences
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 800 }}>
                {/* Tenant Configuration */}
                <Tile>
                    <div style={{ marginBottom: '1rem' }}>
                        <h6 style={{ fontWeight: 600, marginBottom: '0.5rem', marginTop: 0 }}>
                            Tenant Configuration
                        </h6>
                        <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', marginTop: 0 }}>
                            Your tenant ID is used to identify your organization in API requests.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1, maxWidth: 300 }}>
                            <FrokTextField
                                id="tenant-id"
                                label="Tenant ID"
                                value={localTenantId}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalTenantId(e.target.value)}
                            />
                        </div>
                        <Button
                            mode="primary"
                            onClick={handleSaveTenant}
                            disabled={localTenantId === tenantId}
                        >
                            Save
                        </Button>
                    </div>
                </Tile>

                {/* Theme Settings */}
                <Tile>
                    <div style={{ marginBottom: '1rem' }}>
                        <h6 style={{ fontWeight: 600, marginBottom: '0.5rem', marginTop: 0 }}>
                            Appearance
                        </h6>
                        <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', marginBottom: 0, marginTop: 0 }}>
                            Customize the look and feel of the application.
                        </p>
                    </div>

                    <Toggle
                        id="dark-mode-toggle"
                        leftLabel="Dark Mode"
                        checked={mode === 'dark'}
                        onChange={toggleTheme}
                    />
                </Tile>

                {/* API Configuration */}
                <Tile>
                    <div style={{ marginBottom: '1rem' }}>
                        <h6 style={{ fontWeight: 600, marginBottom: '0.5rem', marginTop: 0 }}>
                            API Configuration
                        </h6>
                        <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', marginTop: 0 }}>
                            Backend API connection settings.
                        </p>
                    </div>

                    <Notification type="neutral" icon="alert-info" defaultOpen>
                        API URL: <code style={{ background: 'var(--app-bg-surface)', padding: '2px 6px', borderRadius: 4 }}>{import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}</code>
                    </Notification>

                    <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.75rem', marginTop: '0.75rem', marginBottom: 0 }}>
                        To change the API URL, set the <code style={{ background: 'var(--app-bg-surface)', padding: '2px 6px', borderRadius: 4 }}>VITE_API_BASE_URL</code> environment variable.
                    </p>
                </Tile>

                {/* Azure AD Settings */}
                <Tile>
                    <div style={{ marginBottom: '1rem' }}>
                        <h6 style={{ fontWeight: 600, marginBottom: '0.5rem', marginTop: 0 }}>
                            Authentication
                        </h6>
                        <p style={{ color: 'var(--app-text-secondary)', fontSize: '0.875rem', marginBottom: 0, marginTop: 0 }}>
                            Azure AD authentication settings.
                        </p>
                    </div>

                    <Notification type="neutral" icon="alert-info" defaultOpen>
                        Azure AD is currently <strong>{import.meta.env.VITE_USE_AZURE_AD === 'true' ? 'enabled' : 'disabled'}</strong>.
                        Set <code style={{ background: 'var(--app-bg-surface)', padding: '2px 6px', borderRadius: 4 }}>VITE_USE_AZURE_AD=true</code> to enable Azure AD authentication.
                    </Notification>
                </Tile>
            </div>
        </Layout>
    );
};
