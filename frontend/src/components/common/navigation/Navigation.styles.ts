import styled from "styled-components";
import {darkTheme} from "../../../theme/dark.colors";

export const NavigationRootStyled = styled.div`
    min-height: 100%;
    width: 3rem;

    @media (max-width: 768px) {
        width: 0;
        min-height: 0;
    }
`;

export const NavigationDockStyled = styled.div`
    border-right: 0.5px solid #434557;
    width: 2.5rem;
    height: 100vh;
    background: ${darkTheme.backgroundDarkest};
    color: ${darkTheme.text.color};
    font-size: ${darkTheme.text.fontSize};
    font-weight: ${darkTheme.text.fontWeightSemiBold};
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: fixed;
    left: 0;
    top: 0;
    
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
        
        &:hover {
            background: ${darkTheme.accent};
            border-radius: 4px;
        }
    }

    @media (max-width: 768px) {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        top: auto;
        width: 100%;
        height: 3rem;
        border-right: none;
        border-top: 0.5px solid #434557;
        flex-direction: row;
        justify-content: flex-start;
        z-index: 999;
        padding: 0;
        
        div {
            /* margin: 0; */
            display: flex;
            align-items: center;
            /* justify-content: center; */
            /* min-width: 2rem; */
            /* height: 100%; */
            /* height: 32px; */
        }
        
        .material-symbols-outlined {
            font-size: 24px;
            padding: 8px;
            
            &#selected {
                background: ${darkTheme.accent};
                border-radius: 6px;
            }
        }
        
        /* Scrollable left section */
        & > div:not(:last-child):not(:nth-last-child(2)) {
            flex-shrink: 0;
        }
    }
`;

export const MobileNavWrapper = styled.div`
    @media (max-width: 768px) {
        display: flex;
        width: 100%;
        height: 100%;
    }
`;

export const MobileNavScrollable = styled.div`
    @media (max-width: 768px) {
        display: flex;
        flex: 1;
        overflow-x: auto;
        overflow-y: hidden;
        
        &::-webkit-scrollbar {
            height: 2px;
        }

        &::-webkit-scrollbar-track {
            background: transparent;
        }

        &::-webkit-scrollbar-thumb {
            background: ${darkTheme.accent}40;
        }
    }
`;

export const MobileNavFixed = styled.div`
    @media (max-width: 768px) {
        display: flex;
        /* border-left: 0.5px solid #434557; */
        overflow-y: hidden;
        background: ${darkTheme.backgroundDarkest};
    }
`;