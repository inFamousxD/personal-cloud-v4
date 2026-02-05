import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

export interface EffectivePermissions {
    userId: string;
    isAdmin: boolean;
    deniedFeatures: string[];
    allowedFeatures: string[];
    useDefaults: boolean;
}

interface PermissionsContextType {
    permissions: EffectivePermissions | null;
    isLoading: boolean;
    error: string | null;
    hasAccess: (feature: string) => boolean;
    isAdmin: boolean;
    refreshPermissions: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const usePermissions = () => {
    const context = useContext(PermissionsContext);
    if (!context) {
        throw new Error('usePermissions must be used within PermissionsProvider');
    }
    return context;
};

interface PermissionsProviderProps {
    children: React.ReactNode;
}

// Default permissions when not authenticated or on error
const DEFAULT_PERMISSIONS: EffectivePermissions = {
    userId: '',
    isAdmin: false,
    deniedFeatures: ['agent', 'terminal', 'server'],
    allowedFeatures: ['notes', 'journal', 'lists', 'tracker', 'settings', 'drawings'],
    useDefaults: true,
};

export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({ children }) => {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [permissions, setPermissions] = useState<EffectivePermissions | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPermissions = useCallback(async () => {
        // Wait for auth to finish loading
        if (authLoading) {
            return;
        }

        // If not authenticated, set default permissions and stop loading
        if (!isAuthenticated || !user?.token) {
            setPermissions(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/api/admin/me`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
            });

            if (response.status === 401 || response.status === 403) {
                // Token might be invalid but don't trigger logout from here
                // Just use default permissions
                console.warn('Permission fetch returned auth error, using defaults');
                setPermissions({ ...DEFAULT_PERMISSIONS, userId: user.email || '' });
                setIsLoading(false);
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch permissions');
            }

            const data: EffectivePermissions = await response.json();
            setPermissions(data);
        } catch (err) {
            console.error('Error fetching permissions:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch permissions');
            // Set default permissions on error - don't break the app
            setPermissions({ ...DEFAULT_PERMISSIONS, userId: user?.email || '' });
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, authLoading, user?.token, user?.email]);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    const hasAccess = useCallback((feature: string): boolean => {
        // While loading, allow access to prevent flash of restricted content
        if (isLoading || authLoading) return true;
        if (!permissions) return true; // Not authenticated, let ProtectedRoute handle it
        if (permissions.isAdmin) return true;
        return !permissions.deniedFeatures.includes(feature);
    }, [permissions, isLoading, authLoading]);

    const value: PermissionsContextType = {
        permissions,
        isLoading: isLoading || authLoading,
        error,
        hasAccess,
        isAdmin: permissions?.isAdmin ?? false,
        refreshPermissions: fetchPermissions,
    };

    return (
        <PermissionsContext.Provider value={value}>
            {children}
        </PermissionsContext.Provider>
    );
};