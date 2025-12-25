import React, { createContext, useContext, useState, useEffect } from 'react';
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
    isLoading: boolean;
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

// Helper function to decode JWT and check expiration
const isTokenValid = (token: string): boolean => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        const payload = JSON.parse(jsonPayload);
        
        // Check if token has expired
        // exp is in seconds, Date.now() is in milliseconds
        const expirationTime = payload.exp * 1000;
        const currentTime = Date.now();
        
        // Add a 5-minute buffer before actual expiration
        const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
        
        return expirationTime - bufferTime > currentTime;
    } catch (error) {
        console.error('Error validating token:', error);
        return false;
    }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Validate stored token on mount
    useEffect(() => {
        const validateStoredToken = () => {
            try {
                const storedUser = localStorage.getItem('user');
                
                if (!storedUser) {
                    setIsLoading(false);
                    return;
                }

                const userData: User = JSON.parse(storedUser);
                
                // Validate the token
                if (!userData.token || !isTokenValid(userData.token)) {
                    console.log('Stored token is invalid or expired, clearing auth state');
                    localStorage.removeItem('user');
                    setUser(null);
                    setIsLoading(false);
                    return;
                }

                // Token is valid, set user
                setUser(userData);
                setIsLoading(false);
            } catch (error) {
                console.error('Error validating stored token:', error);
                localStorage.removeItem('user');
                setUser(null);
                setIsLoading(false);
            }
        };

        validateStoredToken();
    }, []);

    // Set up interval to check token expiration periodically
    useEffect(() => {
        if (!user) return;

        const checkTokenExpiration = () => {
            if (user.token && !isTokenValid(user.token)) {
                console.log('Token expired, logging out');
                logout();
            }
        };

        // Check every minute
        const intervalId = setInterval(checkTokenExpiration, 60000);

        return () => clearInterval(intervalId);
    }, [user]);

    const login = (credential: string) => {
        try {
            // Validate token before storing
            if (!isTokenValid(credential)) {
                console.error('Attempting to login with invalid or expired token');
                return;
            }

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
        } catch (error) {
            console.error('Error during login:', error);
        }
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
        isLoading,
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