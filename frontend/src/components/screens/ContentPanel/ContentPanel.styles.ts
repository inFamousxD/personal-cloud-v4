import styled from "styled-components";
import {darkTheme} from "../../../theme/dark.colors";

export const DrawerListContainerStyled = styled.div`
  height: 100%;
  background: ${darkTheme.backgroundDarkest};
  color: ${darkTheme.text.color};
  font-size: ${darkTheme.text.fontSize};
  font-weight: ${darkTheme.text.fontWeightSemiBold};
  border-right: 0.5px solid ${darkTheme.border};
  //padding: 0 0 0 10px;
  overflow: auto;
`;

export const ContentPanelStyled = styled.div`
  overflow: auto;
  height: 100%;
  background: ${darkTheme.backgroundDarker};
  color: ${darkTheme.text.color};
  font-size: ${darkTheme.text.fontSize};
  font-weight: ${darkTheme.text.fontWeightSemiBold};
  border-right: 0.5px solid ${darkTheme.border};
  display: flex;
  flex-direction: column;
  //padding: 10px 0 0 10px;
`;

export const ContentPanelHeaderStyled = styled.div`
  display: flex;
  flex-wrap: nowrap;
  flex-grow: 1;
  align-items: stretch;
  font-size: 13px;
  font-weight: 600;
  color: ${darkTheme.accent};
  //padding-left: 10px;
  background: ${darkTheme.backgroundDarker};
  border-bottom: .5px solid ${darkTheme.panelBorder};
  min-height: 36px;
  cursor: default;
  overflow: scroll;
  //padding-top: 10px;
  //padding-bottom: 10.5px;
  &::-webkit-scrollbar {
    display: none;
  }

  
  .tab {
    display: flex;
    flex-wrap: nowrap;
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      font-size: 13px;
      border: none !important;
      padding: 1px;
      &.close {
        margin-top: 2px;
        margin-right: 10px;
        margin-left: 10px;
        visibility: hidden;
      } &.close:hover {
        cursor: pointer;
        background: ${darkTheme.accent};
        border-radius: 9px;
        color: ${darkTheme.backgroundDarker};
      }
      
      &.type {
        margin-left: 8px;
        font-size: 16px;
      }
    }
    align-items: center;
    .title {
      border: none !important;
      padding: 0 5px;
      white-space: nowrap;
    }
    border: 0.5px solid transparent;
    user-select: none;
  }
  :hover {
    border-right: 0.5px solid ${darkTheme.panelBorder};
    border-left: 0.5px solid ${darkTheme.panelBorder};
    background: #282c34;
    .material-symbols-outlined {
      &.close {
        visibility: visible;
      }
    }
  }
`;