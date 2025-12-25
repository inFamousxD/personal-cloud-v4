import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import {
    SettingsContainer,
    SettingsHeader,
    SettingsTitle,
    SettingsBody,
    SettingsSection,
    SectionTitle,
    UserInfoCard,
    UserAvatar,
    UserDetails,
    UserName,
    UserEmail,
    InfoRow,
    InfoLabel,
    InfoValue,
    LogoutButton,
    DangerZone,
    DangerZoneTitle,
    DangerZoneDescription,
    VersionInfo,
    VersionRow,
    Badge
} from './Settings.styles';

const Settings = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const decodeToken = (token: string) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    };

    const tokenPayload = user?.token ? decodeToken(user.token) : null;
    const tokenExpiry = tokenPayload?.exp ? new Date(tokenPayload.exp * 1000) : null;
    const tokenIssued = tokenPayload?.iat ? new Date(tokenPayload.iat * 1000) : null;

    return (
        <SettingsContainer>
            <SettingsHeader>
                <SettingsTitle>
                    <span className="material-symbols-outlined">settings</span>
                    Settings
                </SettingsTitle>
            </SettingsHeader>

            <SettingsBody>
                {/* Account Section */}
                <SettingsSection>
                    <SectionTitle>
                        <span className="material-symbols-outlined">account_circle</span>
                        Account
                    </SectionTitle>

                    <UserInfoCard>
                        <UserAvatar src={user?.picture} alt={user?.name} />
                        <UserDetails>
                            <UserName>{user?.name}</UserName>
                            <UserEmail>{user?.email}</UserEmail>
                            <Badge $variant="success">
                                <span className="material-symbols-outlined" style={{ fontSize: '12px', marginRight: '4px' }}>
                                    verified
                                </span>
                                Google Authenticated
                            </Badge>
                        </UserDetails>
                    </UserInfoCard>

                    <InfoRow>
                        <InfoLabel>Provider</InfoLabel>
                        <InfoValue>Google OAuth 2.0</InfoValue>
                    </InfoRow>
                    <InfoRow>
                        <InfoLabel>User ID</InfoLabel>
                        <InfoValue>{tokenPayload?.sub?.substring(0, 20) || 'N/A'}...</InfoValue>
                    </InfoRow>
                    {tokenIssued && (
                        <InfoRow>
                            <InfoLabel>Token Issued</InfoLabel>
                            <InfoValue>{tokenIssued.toLocaleString()}</InfoValue>
                        </InfoRow>
                    )}
                    {tokenExpiry && (
                        <InfoRow>
                            <InfoLabel>Token Expires</InfoLabel>
                            <InfoValue>{tokenExpiry.toLocaleString()}</InfoValue>
                        </InfoRow>
                    )}
                </SettingsSection>

                {/* Application Info */}
                <SettingsSection>
                    <SectionTitle>
                        <span className="material-symbols-outlined">info</span>
                        Application Info
                    </SectionTitle>

                    <VersionInfo>
                        <VersionRow>
                            <span>Application Name</span>
                            <span>Notes App</span>
                        </VersionRow>
                        <VersionRow>
                            <span>Version</span>
                            <span>1.0.0</span>
                        </VersionRow>
                        <VersionRow>
                            <span>Environment</span>
                            <span>{import.meta.env.MODE}</span>
                        </VersionRow>
                        <VersionRow>
                            <span>API URL</span>
                            <span>{import.meta.env.VITE_API_URL}</span>
                        </VersionRow>
                    </VersionInfo>
                </SettingsSection>

                {/* Session Management */}
                <SettingsSection>
                    <SectionTitle>
                        <span className="material-symbols-outlined">schedule</span>
                        Session Management
                    </SectionTitle>

                    <InfoRow>
                        <InfoLabel>Session Status</InfoLabel>
                        <Badge $variant="success">Active</Badge>
                    </InfoRow>
                    <InfoRow>
                        <InfoLabel>Auto-refresh</InfoLabel>
                        <InfoValue>Every 1 minute</InfoValue>
                    </InfoRow>
                    <InfoRow>
                        <InfoLabel>Token Validation</InfoLabel>
                        <InfoValue>5 min buffer before expiry</InfoValue>
                    </InfoRow>
                </SettingsSection>

                {/* Security & Privacy */}
                <SettingsSection>
                    <SectionTitle>
                        <span className="material-symbols-outlined">security</span>
                        Security & Privacy
                    </SectionTitle>

                    <InfoRow>
                        <InfoLabel>Authentication Method</InfoLabel>
                        <InfoValue>JWT Bearer Token</InfoValue>
                    </InfoRow>
                    <InfoRow>
                        <InfoLabel>Data Storage</InfoLabel>
                        <InfoValue>MongoDB Atlas (Encrypted)</InfoValue>
                    </InfoRow>
                    <InfoRow>
                        <InfoLabel>Connection</InfoLabel>
                        <Badge $variant="success">Secure (HTTPS)</Badge>
                    </InfoRow>
                </SettingsSection>

                {/* Danger Zone */}
                <SettingsSection>
                    <SectionTitle>
                        <span className="material-symbols-outlined">warning</span>
                        Danger Zone
                    </SectionTitle>

                    <DangerZone>
                        <DangerZoneTitle>
                            <span className="material-symbols-outlined">logout</span>
                            Sign Out
                        </DangerZoneTitle>
                        <DangerZoneDescription>
                            This will end your current session and remove your authentication credentials from this device. 
                            You will need to sign in again to access your notes.
                        </DangerZoneDescription>
                        <LogoutButton onClick={handleLogout}>
                            <span className="material-symbols-outlined">logout</span>
                            Sign Out
                        </LogoutButton>
                    </DangerZone>
                </SettingsSection>
            </SettingsBody>
        </SettingsContainer>
    );
};

export default Settings;