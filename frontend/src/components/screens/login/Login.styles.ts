import styled from 'styled-components';
import { theme } from '../../../themes/dark.theme';

export const LoginContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: ${theme.background};
`;

export const LoginCard = styled.div`
    background-color: ${theme.background_secondary};
    border: 1px solid ${theme.primary}33;
    border-radius: 12px;
    padding: 48px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
`;

export const LoginTitle = styled.h1`
    color: ${theme.primary};
    font-family: 'Sora', sans-serif;
    font-size: 32px;
    font-weight: 600;
    margin: 0;
`;

export const LoginDescription = styled.p`
    color: ${theme.primary}cc;
    font-family: 'Sora', sans-serif;
    font-size: 16px;
    margin: 0;
    text-align: center;
`;