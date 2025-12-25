// Azure AD / MSAL Configuration
// Set VITE_USE_AZURE_AD=true in .env to enable Azure AD authentication

export const msalConfig = {
    auth: {
        clientId: import.meta.env.VITE_AZURE_CLIENT_ID || 'your-client-id',
        authority: import.meta.env.VITE_AZURE_AUTHORITY || 'https://login.microsoftonline.com/your-tenant-id',
        redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || window.location.origin,
    },
    cache: {
        cacheLocation: 'localStorage' as const,
        storeAuthStateInCookie: false,
    },
};

export const loginRequest = {
    scopes: ['User.Read', 'openid', 'profile', 'email'],
};

// Feature flag to enable/disable Azure AD
export const useAzureAD = import.meta.env.VITE_USE_AZURE_AD === 'true';

// Default tenant ID when Azure AD is disabled
export const defaultTenantId = import.meta.env.VITE_DEFAULT_TENANT_ID || 'demo-tenant';
