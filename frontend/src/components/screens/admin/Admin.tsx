import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { usePermissions } from '../../../contexts/PermissionsContext';
import {
    AdminContainer,
    AdminHeader,
    AdminTitle,
    AdminBody,
    AdminSection,
    SectionHeader,
    SectionTitle,
    FeatureGrid,
    FeatureToggle,
    SearchBar,
    UserList,
    UserCard,
    UserCardHeader,
    UserAvatar,
    UserInfo,
    UserName,
    UserEmail,
    UserBadges,
    Badge,
    UserCardBody,
    PermissionRow,
    PermissionLabel,
    Toggle,
    ActionButton,
    ButtonGroup,
    InfoText,
    EmptyState,
    Pagination,
    LoadingSpinner,
    ErrorMessage,
    SuccessMessage,
} from './Admin.styles';

const API_URL = import.meta.env.VITE_API_URL;

interface DefaultPermissions {
    deniedFeatures: string[];
    allFeatures: string[];
    alwaysAllowed: string[];
    updatedAt: string;
    updatedBy: string;
}

interface UserPermission {
    userId: string;
    email?: string;
    name?: string;
    isAdmin: boolean;
    useDefaults: boolean;
    deniedFeatures: string[];
    effectiveDeniedFeatures: string[];
    createdAt: string;
    updatedAt: string;
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

const Admin: React.FC = () => {
    const { user } = useAuth();
    const { isAdmin, refreshPermissions } = usePermissions();
    
    // State
    const [defaults, setDefaults] = useState<DefaultPermissions | null>(null);
    const [users, setUsers] = useState<UserPermission[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    // Pending changes for defaults
    const [pendingDefaultDenied, setPendingDefaultDenied] = useState<string[]>([]);
    const [hasDefaultChanges, setHasDefaultChanges] = useState(false);

    const getAuthHeaders = useCallback(() => ({
        'Authorization': `Bearer ${user?.token}`,
        'Content-Type': 'application/json',
    }), [user?.token]);

    // Fetch default permissions
    const fetchDefaults = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/defaults`, {
                headers: getAuthHeaders(),
            });
            if (!response.ok) throw new Error('Failed to fetch defaults');
            const data = await response.json();
            setDefaults(data);
            setPendingDefaultDenied(data.deniedFeatures);
            setHasDefaultChanges(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch defaults');
        }
    }, [getAuthHeaders]);

    // Fetch users
    const fetchUsers = useCallback(async (page = 1, search = '') => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({ page: String(page), limit: '20' });
            if (search) params.append('search', search);
            
            const response = await fetch(`${API_URL}/api/admin/users?${params}`, {
                headers: getAuthHeaders(),
            });
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setUsers(data.users);
            setPagination(data.pagination);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    }, [getAuthHeaders]);

    // Initial load
    useEffect(() => {
        if (isAdmin) {
            fetchDefaults();
            fetchUsers();
        }
    }, [isAdmin, fetchDefaults, fetchUsers]);

    // Search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers(1, searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, fetchUsers]);

    // Clear messages after timeout
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Toggle feature in defaults
    const toggleDefaultFeature = (feature: string) => {
        if (defaults?.alwaysAllowed.includes(feature)) return;
        
        setPendingDefaultDenied(prev => {
            const newDenied = prev.includes(feature)
                ? prev.filter(f => f !== feature)
                : [...prev, feature];
            setHasDefaultChanges(JSON.stringify(newDenied.sort()) !== JSON.stringify(defaults?.deniedFeatures.sort()));
            return newDenied;
        });
    };

    // Save default permissions
    const saveDefaults = async () => {
        try {
            setIsSaving(true);
            const response = await fetch(`${API_URL}/api/admin/defaults`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ deniedFeatures: pendingDefaultDenied }),
            });
            if (!response.ok) throw new Error('Failed to save defaults');
            await fetchDefaults();
            setSuccess('Default permissions saved successfully');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save defaults');
        } finally {
            setIsSaving(false);
        }
    };

    // Apply defaults to all users
    const applyDefaultsToAll = async () => {
        if (!confirm('This will reset all non-admin users to use default permissions. Continue?')) return;
        
        try {
            setIsSaving(true);
            const response = await fetch(`${API_URL}/api/admin/apply-defaults`, {
                method: 'POST',
                headers: getAuthHeaders(),
            });
            if (!response.ok) throw new Error('Failed to apply defaults');
            const data = await response.json();
            setSuccess(`Applied defaults to ${data.modifiedCount} users`);
            fetchUsers(pagination?.page || 1, searchQuery);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to apply defaults');
        } finally {
            setIsSaving(false);
        }
    };

    // Update user permission
    const updateUserPermission = async (userId: string, updates: Partial<UserPermission>) => {
        try {
            setIsSaving(true);
            const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updates),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update user');
            }
            setSuccess('User permissions updated');
            fetchUsers(pagination?.page || 1, searchQuery);
            
            // Refresh own permissions if updating self
            if (userId === user?.email) {
                refreshPermissions();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update user');
        } finally {
            setIsSaving(false);
        }
    };

    // Toggle user feature
    const toggleUserFeature = (userPerm: UserPermission, feature: string) => {
        if (userPerm.isAdmin || defaults?.alwaysAllowed.includes(feature)) return;
        
        const newDenied = userPerm.deniedFeatures.includes(feature)
            ? userPerm.deniedFeatures.filter(f => f !== feature)
            : [...userPerm.deniedFeatures, feature];
        
        updateUserPermission(userPerm.userId, { 
            deniedFeatures: newDenied,
            useDefaults: false,
        });
    };

    // Toggle useDefaults for user
    const toggleUserDefaults = (userPerm: UserPermission) => {
        updateUserPermission(userPerm.userId, { useDefaults: !userPerm.useDefaults });
    };

    // Toggle admin status
    const toggleUserAdmin = (userPerm: UserPermission) => {
        if (!confirm(`${userPerm.isAdmin ? 'Remove' : 'Grant'} admin privileges for ${userPerm.name || userPerm.email}?`)) return;
        updateUserPermission(userPerm.userId, { isAdmin: !userPerm.isAdmin });
    };

    if (!isAdmin) {
        return (
            <AdminContainer>
                <AdminHeader>
                    <AdminTitle>
                        <span className="material-symbols-outlined">admin_panel_settings</span>
                        Admin Panel
                    </AdminTitle>
                </AdminHeader>
                <AdminBody>
                    <ErrorMessage>
                        <span className="material-symbols-outlined">lock</span>
                        You do not have permission to access this page.
                    </ErrorMessage>
                </AdminBody>
            </AdminContainer>
        );
    }

    return (
        <AdminContainer>
            <AdminHeader>
                <AdminTitle>
                    <span className="material-symbols-outlined">admin_panel_settings</span>
                    Admin Panel
                </AdminTitle>
            </AdminHeader>

            <AdminBody>
                {error && (
                    <ErrorMessage>
                        <span className="material-symbols-outlined">error</span>
                        {error}
                    </ErrorMessage>
                )}

                {success && (
                    <SuccessMessage>
                        <span className="material-symbols-outlined">check_circle</span>
                        {success}
                    </SuccessMessage>
                )}

                {/* Default Permissions Section */}
                <AdminSection>
                    <SectionHeader>
                        <SectionTitle>
                            <span className="material-symbols-outlined">tune</span>
                            Default Permissions for New Users
                        </SectionTitle>
                    </SectionHeader>
                    
                    <InfoText>
                        Toggle features to allow/deny for new users by default. Denied features will be hidden from the navigation.
                    </InfoText>

                    {defaults ? (
                        <>
                            <FeatureGrid style={{ marginTop: '12px' }}>
                                {defaults.allFeatures.map(feature => {
                                    const isDenied = pendingDefaultDenied.includes(feature);
                                    const isAlwaysAllowed = defaults.alwaysAllowed.includes(feature);
                                    
                                    return (
                                        <FeatureToggle 
                                            key={feature} 
                                            $denied={isDenied}
                                            style={isAlwaysAllowed ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={!isDenied}
                                                onChange={() => toggleDefaultFeature(feature)}
                                                disabled={isAlwaysAllowed}
                                            />
                                            <span>{feature}</span>
                                            {/* {isAlwaysAllowed && <Badge>always on</Badge>} */}
                                        </FeatureToggle>
                                    );
                                })}
                            </FeatureGrid>

                            <ButtonGroup>
                                <ActionButton 
                                    onClick={saveDefaults} 
                                    disabled={!hasDefaultChanges || isSaving}
                                >
                                    <span className="material-symbols-outlined">save</span>
                                    Save Defaults
                                </ActionButton>
                                <ActionButton 
                                    $variant="secondary"
                                    onClick={applyDefaultsToAll}
                                    disabled={isSaving}
                                >
                                    <span className="material-symbols-outlined">sync</span>
                                    Apply to All Non-Admins
                                </ActionButton>
                            </ButtonGroup>
                        </>
                    ) : (
                        <LoadingSpinner>
                            <span className="material-symbols-outlined">progress_activity</span>
                        </LoadingSpinner>
                    )}
                </AdminSection>

                {/* User Management Section */}
                <AdminSection>
                    <SectionHeader>
                        <SectionTitle>
                            <span className="material-symbols-outlined">group</span>
                            User Management
                        </SectionTitle>
                    </SectionHeader>

                    <SearchBar>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </SearchBar>

                    {isLoading ? (
                        <LoadingSpinner>
                            <span className="material-symbols-outlined">progress_activity</span>
                        </LoadingSpinner>
                    ) : users.length === 0 ? (
                        <EmptyState>
                            <span className="material-symbols-outlined">person_off</span>
                            No users found
                        </EmptyState>
                    ) : (
                        <>
                            <UserList>
                                {users.map(userPerm => (
                                    <UserCard 
                                        key={userPerm.userId}
                                        $expanded={expandedUserId === userPerm.userId}
                                    >
                                        <UserCardHeader onClick={() => setExpandedUserId(
                                            expandedUserId === userPerm.userId ? null : userPerm.userId
                                        )}>
                                            <UserAvatar>
                                                {(userPerm.name?.[0] || userPerm.email?.[0] || '?').toUpperCase()}
                                            </UserAvatar>
                                            <UserInfo>
                                                <UserName>{userPerm.name || 'Unknown'}</UserName>
                                                <UserEmail>{userPerm.email || userPerm.userId}</UserEmail>
                                            </UserInfo>
                                            <UserBadges>
                                                {userPerm.isAdmin && <Badge $variant="admin">Admin</Badge>}
                                                {!userPerm.isAdmin && userPerm.useDefaults && <Badge $variant="default">Defaults</Badge>}
                                                {!userPerm.isAdmin && !userPerm.useDefaults && <Badge $variant="custom">Custom</Badge>}
                                                {!userPerm.isAdmin && userPerm.effectiveDeniedFeatures.length > 0 && (
                                                    <Badge $variant="denied">{userPerm.effectiveDeniedFeatures.length} denied</Badge>
                                                )}
                                            </UserBadges>
                                            <span className="material-symbols-outlined">
                                                {expandedUserId === userPerm.userId ? 'expand_less' : 'expand_more'}
                                            </span>
                                        </UserCardHeader>

                                        {expandedUserId === userPerm.userId && (
                                            <UserCardBody>
                                                <PermissionRow>
                                                    <PermissionLabel>Administrator</PermissionLabel>
                                                    <Toggle>
                                                        <input
                                                            type="checkbox"
                                                            checked={userPerm.isAdmin}
                                                            onChange={() => toggleUserAdmin(userPerm)}
                                                            disabled={isSaving}
                                                        />
                                                        <span />
                                                    </Toggle>
                                                </PermissionRow>

                                                {!userPerm.isAdmin && (
                                                    <>
                                                        <PermissionRow>
                                                            <PermissionLabel>Use Default Permissions</PermissionLabel>
                                                            <Toggle>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={userPerm.useDefaults}
                                                                    onChange={() => toggleUserDefaults(userPerm)}
                                                                    disabled={isSaving}
                                                                />
                                                                <span />
                                                            </Toggle>
                                                        </PermissionRow>

                                                        {!userPerm.useDefaults && defaults && (
                                                            <>
                                                                <InfoText style={{ marginBottom: '12px' }}>
                                                                    Custom feature access:
                                                                </InfoText>
                                                                <FeatureGrid>
                                                                    {defaults.allFeatures.map(feature => {
                                                                        const isDenied = userPerm.deniedFeatures.includes(feature);
                                                                        const isAlwaysAllowed = defaults.alwaysAllowed.includes(feature);
                                                                        
                                                                        return (
                                                                            <FeatureToggle 
                                                                                key={feature} 
                                                                                $denied={isDenied}
                                                                                style={isAlwaysAllowed ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                                                            >
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={!isDenied}
                                                                                    onChange={() => toggleUserFeature(userPerm, feature)}
                                                                                    disabled={isAlwaysAllowed || isSaving}
                                                                                />
                                                                                <span>{feature}</span>
                                                                            </FeatureToggle>
                                                                        );
                                                                    })}
                                                                </FeatureGrid>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </UserCardBody>
                                        )}
                                    </UserCard>
                                ))}
                            </UserList>

                            {pagination && pagination.totalPages > 1 && (
                                <Pagination>
                                    <button
                                        onClick={() => fetchUsers(pagination.page - 1, searchQuery)}
                                        disabled={pagination.page <= 1}
                                    >
                                        Previous
                                    </button>
                                    <span>
                                        Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
                                    </span>
                                    <button
                                        onClick={() => fetchUsers(pagination.page + 1, searchQuery)}
                                        disabled={pagination.page >= pagination.totalPages}
                                    >
                                        Next
                                    </button>
                                </Pagination>
                            )}
                        </>
                    )}
                </AdminSection>
            </AdminBody>
        </AdminContainer>
    );
};

export default Admin;