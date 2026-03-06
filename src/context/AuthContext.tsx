import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PublicClientApplication, AccountInfo } from '@azure/msal-browser';
import { MsalProvider, useMsal, useIsAuthenticated } from '@azure/msal-react';
import { msalConfig, loginRequest, useAzureAD, defaultTenantId, graphScopes } from '../config/auth';
import { initializeApiClient, RAGaaSClient } from '../services/api';

interface AuthContextType {
    tenantId: string;
    isAuthenticated: boolean;
    isLoading: boolean;
    user: AccountInfo | null;
    accessToken: string | null;
    apiClient: RAGaaSClient;
    login: () => Promise<void>;
    logout: () => void;
    setTenantId: (id: string) => void;
    /** Acquires a Microsoft Graph-scoped token (User.ReadBasic.All) on demand. Returns null when Azure AD is disabled. */
    getGraphToken: () => Promise<string | null>;
}

/** Decode a JWT without any library — Base64url-decodes the payload. */
function decodeJwt(token: string): Record<string, unknown> | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(json);
    } catch {
        return null;
    }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// MSAL v4 requires initialize() to be awaited before MsalProvider mounts.
const msalInstance = new PublicClientApplication(msalConfig);
export const msalInitPromise = msalInstance.initialize();

// ─── Inner provider (inside MsalProvider) ────────────────────────────────────
const AuthProviderInner: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { instance, accounts, inProgress } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const [tenantId, setTenantIdState] = useState<string>(
        () => localStorage.getItem('ragaas_tenant_id') || defaultTenantId
    );
    const [apiClient] = useState<RAGaaSClient>(() => initializeApiClient(tenantId));
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const isLoading = false;

    useEffect(() => {
        localStorage.setItem('ragaas_tenant_id', tenantId);
        apiClient.setTenantId(tenantId);
    }, [tenantId, apiClient]);

    // Handle redirect response on page load
    useEffect(() => {
        instance.handleRedirectPromise().catch(() => {
            // Redirect handling failed — ignore
        });
    }, [instance]);

    // Auto-login on first load when no cached session exists (using redirect)
    useEffect(() => {
        if (!isAuthenticated && accounts.length === 0 && inProgress === 'none') {
            instance.loginRedirect(loginRequest).catch(() => {
                // Login failed — fall back to defaultTenantId (already the initial state)
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inProgress]);

    // Acquire / refresh the access token whenever the signed-in account changes
    useEffect(() => {
        if (!isAuthenticated || accounts.length === 0) return;

        const acquireToken = async () => {
            try {
                const result = await instance.acquireTokenSilent({
                    ...loginRequest,
                    account: accounts[0],
                });

                const token = result.accessToken;
                setAccessToken(token);
                if (apiClient) apiClient.setAccessToken(token);

                // Extract NTID from UPN (e.g. "tqu3hc@bosch.com" → "TQU3HC") and use as tenantId
                const decoded = decodeJwt(token);
                if (decoded) {
                    const upn = (decoded['preferred_username'] ?? decoded['upn'] ?? '') as string;
                    const ntid = upn.split('@')[0].toUpperCase();
                    if (ntid) {
                        setTenantIdState(ntid);
                        if (apiClient) apiClient.setTenantId(ntid);
                    }
                }

            } catch {
                // Silent acquisition failed — try redirect, fall back to defaultTenantId on total failure
                try {
                    await instance.acquireTokenRedirect({ ...loginRequest, account: accounts[0] });
                } catch {
                    // Both failed: tenantId stays as defaultTenantId (already the initial state)
                }
            }
        };

        acquireToken();
    }, [isAuthenticated, accounts, instance, apiClient]);

    const login = async () => {
        await instance.loginRedirect(loginRequest).catch(() => { /* ignore */ });
    };

    const logout = () => instance.logoutRedirect();
    const setTenantId = (id: string) => setTenantIdState(id);
    const user = accounts[0] ?? null;

    const getGraphToken = async (): Promise<string | null> => {
        if (!isAuthenticated || accounts.length === 0) return null;
        try {
            const result = await instance.acquireTokenSilent({
                ...graphScopes,
                account: accounts[0],
            });
            return result.accessToken;
        } catch {
            try {
                await instance.acquireTokenRedirect({ ...graphScopes, account: accounts[0] });
            } catch {
                // ignore
            }
            return null;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                tenantId,
                isAuthenticated,
                isLoading,
                user,
                accessToken,
                apiClient,
                login,
                logout,
                setTenantId,
                getGraphToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// ─── Local provider (Azure AD disabled) ──────────────────────────────────────
const AuthProviderLocal: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tenantId, setTenantIdState] = useState<string>(
        () => localStorage.getItem('ragaas_tenant_id') || defaultTenantId
    );
    const [apiClient] = useState<RAGaaSClient>(() => initializeApiClient(tenantId));
    const isLoading = false;

    useEffect(() => {
        localStorage.setItem('ragaas_tenant_id', tenantId);
        apiClient.setTenantId(tenantId);
    }, [tenantId, apiClient]);

    const login  = async () => { /* no-op in local mode */ };
    const logout = () => {
        localStorage.removeItem('ragaas_tenant_id');
        setTenantIdState(defaultTenantId);
    };

    return (
        <AuthContext.Provider
            value={{
                tenantId,
                isAuthenticated: true,
                isLoading,
                user: null,
                accessToken: null,
                apiClient,
                login,
                logout,
                setTenantId: (id) => setTenantIdState(id),
                getGraphToken: async () => null,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// ─── Root provider — waits for MSAL init before mounting MsalProvider ─────────
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [msalReady, setMsalReady] = useState(!useAzureAD);

    useEffect(() => {
        if (!useAzureAD) return;
        msalInitPromise.then(() => setMsalReady(true));
    }, []);

    if (!msalReady) return null; // wait for MSAL to initialize

    if (useAzureAD) {
        return (
            <MsalProvider instance={msalInstance}>
                <AuthProviderInner>{children}</AuthProviderInner>
            </MsalProvider>
        );
    }

    return <AuthProviderLocal>{children}</AuthProviderLocal>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
