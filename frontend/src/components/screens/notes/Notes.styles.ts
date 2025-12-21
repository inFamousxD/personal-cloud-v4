import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

export const NotesContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: ${darkTheme.backgroundDarker};
    width: 100%;
`;

export const NotesHeader = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 32px;
    background-color: ${darkTheme.backgroundDarkest};
    border-bottom: 1px solid ${darkTheme.accent}33;
`;

export const NotesTitle = styled.h1`
    color: ${darkTheme.accent};
    font-family: JetBrains Mono;
    font-size: 28px;
    font-weight: 600;
    margin: 0;
`;

export const UserInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

export const UserAvatar = styled.img`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid ${darkTheme.accent}33;
`;

export const UserName = styled.span`
    color: ${darkTheme.accent};
    font-family: JetBrains Mono;
    font-size: 16px;
`;

export const LogoutButton = styled.button`
    background-color: transparent;
    border: 1px solid ${darkTheme.accent}66;
    color: ${darkTheme.accent};
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-family: JetBrains Mono;
    transition: all 0.2s;

    &:hover {
        background-color: ${darkTheme.accent}11;
        border-color: ${darkTheme.accent};
    }
`;

export const NotesContent = styled.div`
    display: grid;
    grid-template-columns: 350px 1fr;
    flex: 1;
    overflow: hidden;
`;

export const NotesList = styled.div`
    background-color: ${darkTheme.backgroundDarkest};
    border-right: 1px solid ${darkTheme.accent}33;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

export const CreateNoteButton = styled.button`
    background-color: ${darkTheme.accent};
    color: ${darkTheme.backgroundDarker};
    border: none;
    padding: 12px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-family: JetBrains Mono;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.2s;

    &:hover {
        opacity: 0.9;
        transform: translateY(-1px);
    }
`;

export const NoteCard = styled.div<{ $isSelected?: boolean }>`
    background-color: ${(props) =>
        props.$isSelected ? darkTheme.accent + '11' : darkTheme.backgroundDarker};
    border: 1px solid
        ${(props) => (props.$isSelected ? darkTheme.accent : darkTheme.accent + '33')};
    border-radius: 8px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;

    &:hover {
        border-color: ${darkTheme.accent};
        transform: translateX(2px);
    }
`;

export const NoteCardActions = styled.div`
    margin-top: 12px;
    display: flex;
    gap: 8px;
`;

export const NoteTitle = styled.h3`
    color: ${darkTheme.accent};
    font-family: JetBrains Mono;
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 8px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const NotePreview = styled.p`
    color: ${darkTheme.accent}99;
    font-family: JetBrains Mono;
    font-size: 14px;
    margin: 0 0 8px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
`;

export const NoteDate = styled.span`
    color: ${darkTheme.accent}66;
    font-family: JetBrains Mono;
    font-size: 12px;
`;

export const NoteEditor = styled.div`
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
`;

export const EditorInput = styled.input`
    background-color: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.accent}33;
    border-radius: 8px;
    color: ${darkTheme.accent};
    font-family: JetBrains Mono;
    font-size: 24px;
    font-weight: 600;
    padding: 16px;
    outline: none;

    &:focus {
        border-color: ${darkTheme.accent};
    }

    &::placeholder {
        color: ${darkTheme.accent}66;
    }
`;

export const EditorTextarea = styled.textarea`
    background-color: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.accent}33;
    border-radius: 8px;
    color: ${darkTheme.accent};
    font-family: JetBrains Mono;
    font-size: 16px;
    padding: 16px;
    outline: none;
    resize: none;
    flex: 1;
    min-height: 400px;

    &:focus {
        border-color: ${darkTheme.accent};
    }

    &::placeholder {
        color: ${darkTheme.accent}66;
    }
`;

export const EditorActions = styled.div`
    display: flex;
    gap: 12px;
    justify-content: flex-end;
`;

export const SaveButton = styled.button`
    background-color: ${darkTheme.accent};
    color: ${darkTheme.backgroundDarker};
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-family: JetBrains Mono;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.2s;

    &:hover {
        opacity: 0.9;
    }
`;

export const CancelButton = styled.button`
    background-color: transparent;
    border: 1px solid ${darkTheme.accent}66;
    color: ${darkTheme.accent};
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-family: JetBrains Mono;
    font-size: 16px;
    transition: all 0.2s;

    &:hover {
        background-color: ${darkTheme.accent}11;
        border-color: ${darkTheme.accent};
    }
`;

export const DeleteButton = styled.button`
    background-color: transparent;
    border: 1px solid #ff6b6b;
    color: #ff6b6b;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-family: JetBrains Mono;
    font-size: 13px;
    transition: all 0.2s;

    &:hover {
        background-color: #ff6b6b;
        color: ${darkTheme.backgroundDarker};
    }
`;

export const EmptyState = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: ${darkTheme.accent}66;
    font-family: JetBrains Mono;
    font-size: 16px;
    text-align: center;
    padding: 32px;
`;