import styled from "styled-components";
import {darkTheme} from "../../../theme/dark.colors";

export const NavigationRootStyled = styled.div`
    min-height: 100%;
    width: 3rem;
`;

export const NavigationDockStyled = styled.div`
    border-right: 0.5px solid #434557;
    width: 2.5rem;
    background: ${darkTheme.backgroundDarkest};
    color: ${darkTheme.text.color};
    font-size: ${darkTheme.text.fontSize};
    font-weight: ${darkTheme.text.fontWeightSemiBold};
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    div {
        margin: 4px 5px;
    }
    
    .material-symbols-outlined {
        font-size: 20px;
        cursor: pointer;
        user-select: none;
        padding: 4px;
        transition: all ease-in-out 100ms;
        
        &#selected {
        background: ${darkTheme.accent};
        border-radius: 4px;
        }
    }
    :hover {
        background: ${darkTheme.accent};
        border-radius: 4px;
    } 
`;