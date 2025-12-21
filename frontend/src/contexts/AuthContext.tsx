import React, { createContext, useContext, useState } from 'react';
import { googleLogout, GoogleOAuthProvider } from '@react-oauth/google';

interface User {
    email: string;
    name: string;
    picture: string;
    token: string;
}

interface AuthContextType {
    user: User | null;
    login: (credential: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const login = (credential: string) => {
        // Decode JWT to get user info
        const base64Url = credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        const payload = JSON.parse(jsonPayload);

        const userData: User = {
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            token: credential,
        };

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        googleLogout();
        setUser(null);
        localStorage.removeItem('user');
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

interface GoogleAuthWrapperProps {
    children: React.ReactNode;
}

export const GoogleAuthWrapper: React.FC<GoogleAuthWrapperProps> = ({ children }) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
        console.error('Google Client ID is not configured');
        return <div>Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file</div>;
    }

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <AuthProvider>{children}</AuthProvider>
        </GoogleOAuthProvider>
    );
};