import React from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,

    Switch,
    FormControlLabel,
    Alert,
    useTheme,
} from '@mui/material';
import { useAuth, useTheme as useAppTheme } from '../context';

export const SettingsPage: React.FC = () => {
    useTheme();
    const { tenantId, setTenantId } = useAuth();
    const { mode, toggleTheme } = useAppTheme();
    const [localTenantId, setLocalTenantId] = React.useState(tenantId);

    const handleSaveTenant = () => {
        setTenantId(localTenantId);
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
                Settings
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Configure your application preferences
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600 }}>
                {/* Tenant Configuration */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            Tenant Configuration
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Your tenant ID is used to identify your organization in API requests.
                        </Typography>

                        <TextField
                            label="Tenant ID"
                            value={localTenantId}
                            onChange={(e) => setLocalTenantId(e.target.value)}
                            fullWidth
                            sx={{ mb: 2 }}
                        />

                        <Button
                            variant="contained"
                            onClick={handleSaveTenant}
                            disabled={localTenantId === tenantId}
                        >
                            Save Tenant ID
                        </Button>
                    </CardContent>
                </Card>

                {/* Theme Settings */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            Appearance
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Customize the look and feel of the application.
                        </Typography>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={mode === 'dark'}
                                    onChange={toggleTheme}
                                />
                            }
                            label="Dark Mode"
                        />
                    </CardContent>
                </Card>

                {/* API Configuration */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            API Configuration
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Backend API connection settings.
                        </Typography>

                        <Alert severity="info" sx={{ mb: 2 }}>
                            API URL: <code>{import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}</code>
                        </Alert>

                        <Typography variant="caption" color="text.secondary">
                            To change the API URL, set the <code>VITE_API_BASE_URL</code> environment variable.
                        </Typography>
                    </CardContent>
                </Card>

                {/* Azure AD Settings */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            Authentication
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Azure AD authentication settings.
                        </Typography>

                        <Alert severity="info">
                            Azure AD is currently {import.meta.env.VITE_USE_AZURE_AD === 'true' ? 'enabled' : 'disabled'}.
                            Set <code>VITE_USE_AZURE_AD=true</code> to enable Azure AD authentication.
                        </Alert>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};
