import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { LoginContainer, LoginCard, LoginTitle, LoginDescription } from './Login.styles';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSuccess = (credentialResponse: CredentialResponse) => {
        if (credentialResponse.credential) {
            login(credentialResponse.credential);
            navigate('/notes');
        }
    };

    const handleError = () => {
        console.error('Login Failed');
    };

    return (
        <LoginContainer>
            <LoginCard>
                <LoginTitle>Welcome</LoginTitle>
                <LoginDescription>Sign in with your Google account to continue</LoginDescription>
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={handleError}
                    theme="filled_blue"
                    size="large"
                    shape="rectangular"
                />
            </LoginCard>
        </LoginContainer>
    );
};

export default Login;