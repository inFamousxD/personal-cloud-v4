import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../contexts/PermissionsContext';
import styled from 'styled-components';
import { darkTheme } from '../theme/dark.colors';

interface RestrictedRouteProps {
    feature: string;
    children: React.ReactNode;
}

const AccessDeniedContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    min-height: 400px;
    background: ${darkTheme.backgroundDarker};
    color: ${darkTheme.text.color};
    padding: 40px;
    text-align: center;
`;

const AccessDeniedIcon = styled.div`
    font-size: 64px;
    margin-bottom: 24px;
    color: ${darkTheme.accentOrange};
    
    .material-symbols-outlined {
        font-size: 64px;
    }
`;

const AccessDeniedTitle = styled.h1`
    color: ${darkTheme.accent};
    font-size: 24px;
    margin: 0 0 16px 0;
`;

const AccessDeniedMessage = styled.p`
    color: ${darkTheme.text.color};
    opacity: 0.8;
    font-size: 14px;
    max-width: 400px;
    line-height: 1.6;
    margin: 0 0 24px 0;
`;

const BackButton = styled.button`
    background: ${darkTheme.accent};
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: inherit;
    transition: opacity 0.2s;

    &:hover {
        opacity: 0.9;
    }

    .material-symbols-outlined {
        font-size: 18px;
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    min-height: 200px;
    background: ${darkTheme.backgroundDarker};
    color: ${darkTheme.accent};
    width: 100%;
`;

const AccessDeniedPage: React.FC<{ feature: string }> = ({ feature }) => {
    const handleGoBack = () => {
        window.history.back();
    };

    const featureNames: Record<string, string> = {
        agent: 'AI Agent',
        terminal: 'Terminal',
        server: 'Server Dashboard',
    };

    return (
        <AccessDeniedContainer>
            <AccessDeniedIcon>
                <span className="material-symbols-outlined">lock</span>
            </AccessDeniedIcon>
            <AccessDeniedTitle>Access Restricted</AccessDeniedTitle>
            <AccessDeniedMessage>
                You don't have permission to access the {featureNames[feature] || feature} feature.
                Please contact an administrator to request access.
            </AccessDeniedMessage>
            <BackButton onClick={handleGoBack}>
                <span className="material-symbols-outlined">arrow_back</span>
                Go Back
            </BackButton>
        </AccessDeniedContainer>
    );
};

const RestrictedRoute: React.FC<RestrictedRouteProps> = ({ feature, children }) => {
    const { hasAccess, isLoading, permissions } = usePermissions();

    // Show loading while permissions are being fetched
    if (isLoading) {
        return (
            <LoadingContainer>
                <span className="material-symbols-outlined">hourglass_empty</span>
            </LoadingContainer>
        );
    }

    // If no permissions loaded (shouldn't happen if authenticated), redirect to login
    if (!permissions) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has access to this feature
    if (!hasAccess(feature)) {
        return <AccessDeniedPage feature={feature} />;
    }

    return <>{children}</>;
};

export default RestrictedRoute;