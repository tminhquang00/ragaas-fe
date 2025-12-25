import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PublicClientApplication, AccountInfo } from '@azure/msal-browser';
import { MsalProvider, useMsal, useIsAuthenticated } from '@azure/msal-react';
import { msalConfig, loginRequest, useAzureAD, defaultTenantId } from '../config/auth';
import { initializeApiClient, RAGaaSClient } from '../services/api';

interface AuthContextType {
    tenantId: string;
    isAuthenticated: boolean;
    isLoading: boolean;
    user: AccountInfo | null;
    apiClient: RAGaaSClient | null;
    login: () => Promise<void>;
    logout: () => void;
    setTenantId: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// MSAL instance for Azure AD
const msalInstance = new PublicClientApplication(msalConfig);

// Inner provider that uses MSAL hooks
const AuthProviderInner: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { instance, accounts } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const [tenantId, setTenantIdState] = useState<string>(() => {
        return localStorage.getItem('ragaas_tenant_id') || defaultTenantId;
    });
    const [apiClient, setApiClient] = useState<RAGaaSClient | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Initialize API client
        const client = initializeApiClient(tenantId);
        setApiClient(client);
        setIsLoading(false);
    }, [tenantId]);

    useEffect(() => {
        localStorage.setItem('ragaas_tenant_id', tenantId);
        if (apiClient) {
            apiClient.setTenantId(tenantId);
        }
    }, [tenantId, apiClient]);

    const login = async () => {
        if (useAzureAD) {
            try {
                await instance.loginPopup(loginRequest);
            } catch (error) {
                console.error('Login failed:', error);
            }
        }
    };

    const logout = () => {
        if (useAzureAD) {
            instance.logoutPopup();
        } else {
            localStorage.removeItem('ragaas_tenant_id');
            setTenantIdState(defaultTenantId);
        }
    };

    const setTenantId = (id: string) => {
        setTenantIdState(id);
    };

    const user = accounts[0] || null;
    const effectiveAuth = useAzureAD ? isAuthenticated : true; // Always authenticated when Azure AD is off

    return (
        <AuthContext.Provider
            value={{
                tenantId,
                isAuthenticated: effectiveAuth,
                isLoading,
                user,
                apiClient,
                login,
                logout,
                setTenantId,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Main provider that wraps with Azure AD if enabled
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    if (useAzureAD) {
        return (
            <MsalProvider instance={msalInstance}>
                <AuthProviderInner>{children}</AuthProviderInner>
            </MsalProvider>
        );
    }

    // Simplified provider without Azure AD
    return <AuthProviderInner>{children}</AuthProviderInner>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
