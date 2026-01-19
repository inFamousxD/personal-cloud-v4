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

export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [permissions, setPermissions] = useState<EffectivePermissions | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPermissions = useCallback(async () => {
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

            if (!response.ok) {
                throw new Error('Failed to fetch permissions');
            }

            const data: EffectivePermissions = await response.json();
            setPermissions(data);
        } catch (err) {
            console.error('Error fetching permissions:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch permissions');
            // Set default restrictive permissions on error
            setPermissions({
                userId: user?.email || '',
                isAdmin: false,
                deniedFeatures: ['agent', 'terminal', 'server'],
                allowedFeatures: ['notes', 'journal', 'lists', 'tracker', 'settings'],
                useDefaults: true,
            });
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, user?.token, user?.email]);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    const hasAccess = useCallback((feature: string): boolean => {
        if (!permissions) return false;
        if (permissions.isAdmin) return true;
        return !permissions.deniedFeatures.includes(feature);
    }, [permissions]);

    const value: PermissionsContextType = {
        permissions,
        isLoading,
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