import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

export const NotesContainer = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${darkTheme.backgroundDarker};
    width: 100%;
    padding: 10px;
`;

export const NotesTitle = styled.div`
    color: ${darkTheme.accent};
    font-size: 1.3em;
`;

export const Seperator = styled.div`
    border-bottom: 1px solid ${darkTheme.border};
    padding: 5px;
`;

export const NotesBody = styled.div`
    
`;