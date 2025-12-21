// import { useAuth } from '../../../contexts/AuthContext';
import {
    NotesBody,
    NotesContainer,
    NotesTitle,
    Seperator
} from './Notes.styles';

const Notes = () => {
    // const { user } = useAuth();

    return (
        <NotesContainer>
            <NotesTitle>Notes</NotesTitle>
            <Seperator />
            <NotesBody>
                
            </NotesBody>
        </NotesContainer>
    );
};

export default Notes;