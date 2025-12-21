import styled from "styled-components";
import {darkTheme} from "../../../theme/dark.colors";

export const PanelControlEmptyStyled = styled.div`
    background: ${darkTheme.backgroundDarkest};
    display: flex;
    flex-grow: 1;
    font-size: 13px;
    padding: 10px;
    color: ${darkTheme.text.color};
    justify-content: center;
    height: 100%;
    border-right: 0.5px solid ${darkTheme.border};
    align-items: center;
`;