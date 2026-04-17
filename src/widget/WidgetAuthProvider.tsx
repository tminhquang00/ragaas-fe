import React, { createContext, useContext, useMemo, useEffect, useState, ReactNode } from 'react';
import { RAGaaSClient, initializeApiClient } from '../services/api';

/**
 * Minimal auth shape for the embeddable widget.
 * Mirrors the subset of the main app's useAuth() that chat-related code consumes.
 * Intentionally avoids importing MSAL so the widget bundle stays lean.
 */
interface WidgetAuthContextValue {
  tenantId: string;
  apiClient: RAGaaSClient;
  isAuthenticated: true;
}

const WidgetAuthContext = createContext<WidgetAuthContextValue | undefined>(undefined);

interface WidgetAuthProviderProps {
  tenantId: string;
  children: ReactNode;
}

export const WidgetAuthProvider: React.FC<WidgetAuthProviderProps> = ({ tenantId, children }) => {
  // Singleton API client for the widget session — tenantId is mutated via setTenantId
  // rather than by recreating the client, mirroring the main app's AuthContext.
  const [apiClient] = useState<RAGaaSClient>(() => initializeApiClient(tenantId));

  useEffect(() => {
    apiClient.setTenantId(tenantId);
  }, [tenantId, apiClient]);

  const value = useMemo<WidgetAuthContextValue>(
    () => ({ tenantId, apiClient, isAuthenticated: true }),
    [tenantId, apiClient],
  );

  return <WidgetAuthContext.Provider value={value}>{children}</WidgetAuthContext.Provider>;
};

export const useWidgetAuth = (): WidgetAuthContextValue => {
  const ctx = useContext(WidgetAuthContext);
  if (!ctx) {
    throw new Error('useWidgetAuth must be used within a WidgetAuthProvider');
  }
  return ctx;
};
