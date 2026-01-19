import { ObjectId } from 'mongodb';

// All features in the application (for reference/validation)
export const ALL_FEATURES = [
    'notes',
    'journal',
    'lists',
    'tracker',
    'agent',
    'terminal',
    'server',
    'settings',
] as const;

export type FeatureKey = typeof ALL_FEATURES[number];

// Features denied by default for new users
export const DEFAULT_DENIED_FEATURES: FeatureKey[] = ['agent', 'terminal', 'server'];

// Features that should never be denied (always accessible)
// Only settings should be here - so users can always logout
export const ALWAYS_ALLOWED_FEATURES: FeatureKey[] = ['settings'];

// Singleton document that controls defaults for new users
export interface DefaultPermissions {
    _id: 'default';
    deniedFeatures: string[];
    updatedAt: Date;
    updatedBy: string;
}

// Per-user permissions
export interface UserPermissions {
    _id?: ObjectId;
    userId: string;
    email?: string;        // For easier admin lookup
    name?: string;         // For easier admin lookup
    isAdmin: boolean;
    deniedFeatures: string[];
    useDefaults: boolean;  // If true, inherit from DefaultPermissions
    createdAt: Date;
    updatedAt: Date;
    grantedBy?: string;    // Audit trail
}

// Input types for API
export interface UpdateUserPermissionsInput {
    isAdmin?: boolean;
    deniedFeatures?: string[];
    useDefaults?: boolean;
}

export interface UpdateDefaultPermissionsInput {
    deniedFeatures: string[];
}

export interface BulkApplyDefaultsInput {
    includeAdmins?: boolean;  // Default false - don't reset admin custom settings
}

// Response types
export interface EffectivePermissions {
    userId: string;
    isAdmin: boolean;
    deniedFeatures: string[];
    allowedFeatures: string[];
    useDefaults: boolean;
}

export interface UserPermissionsListItem {
    userId: string;
    email?: string;
    name?: string;
    isAdmin: boolean;
    useDefaults: boolean;
    deniedFeatures: string[];
    effectiveDeniedFeatures: string[];
    createdAt: Date;
    updatedAt: Date;
}