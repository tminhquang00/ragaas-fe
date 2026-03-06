// Azure AD — Authorization Code + PKCE (SPA flow via MSAL)
//
// The working token request from the reference app uses:
//   scope: openid api://2a179870-.../Test profile offline_access
//   grant_type: authorization_code  (PKCE)
//
// The previous "Approval required" error was caused by requesting 'User.Read'
// (a Microsoft Graph permission requiring admin consent). Using only the app's
// own 'Test' scope avoids that entirely.

export const msalConfig = {
    auth: {
        clientId:    import.meta.env.VITE_AZURE_CLIENT_ID   || '',
        authority:   import.meta.env.VITE_AZURE_AUTHORITY   || 'https://login.microsoftonline.com/common',
        redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || window.location.origin,
    },
    cache: {
        cacheLocation: 'localStorage' as const,
        storeAuthStateInCookie: false,
    },
};

// Only request the app's own scope — no Graph (User.Read) so no admin consent needed.
export const loginRequest = {
    scopes: [
        'openid',
        'profile',
        'offline_access',
        `api://${import.meta.env.VITE_AZURE_CLIENT_ID}/Test`,
    ],
};

// Graph-specific scopes — acquired on demand via acquireTokenSilent.
// Used for Microsoft Graph API calls (e.g. user search in ShareDialog).
export const graphScopes = {
    scopes: ['User.ReadBasic.All'],
};

// SharePoint scope — separate from the app's own scope.
// Used to acquire a Microsoft Graph token for SharePoint file access.
export const sharePointLoginRequest = {
    scopes: ['Sites.ReadWrite.All'],
};

// Feature flag — case-insensitive so 'True', 'TRUE', 'true' all work
export const useAzureAD = import.meta.env.VITE_USE_AZURE_AD?.toLowerCase() === 'true';

// Default tenant ID (X-User-ID header) when Azure AD is disabled
export const defaultTenantId = import.meta.env.VITE_DEFAULT_TENANT_ID || 'demo-tenant';

