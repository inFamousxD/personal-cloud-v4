import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

export const NotesContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: ${darkTheme.backgroundDarker};
    width: 100%;
`;