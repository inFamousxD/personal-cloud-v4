import styled from "styled-components";
import {darkTheme} from "../../../../theme/dark.colors";

export const ExplorerListItemStyled = styled.div<{ $depth: number, $hasChildren: boolean, $isSelected: boolean }>`
  .material-symbols-outlined {
    &.expand-icon {
      visibility: ${props => props.$hasChildren ? '' : 'hidden'};
      cursor: pointer;
    }
    font-variation-settings: 'FILL' 0, 'wght' 100, 'GRAD' 0, 'opsz' 24;
    
    &.type-icon {
      margin: 0 8px 0 0;
      font-size: 20px;
    }
  }

  .item-name-block {
    padding-left: ${props => props.$depth * 26}px;
    margin-left: 10px;

    display: flex;
    flex-direction: row;
    flex-grow: 1;

    vertical-align: middle;
    align-items: center;
    //background: #3194d9;
    border-radius: 4px;
    margin-right: 10px;
    background: ${props => props.$isSelected ? darkTheme.accent : 'none'};
    
    &.title {
      color: ${darkTheme.accent};
      margin-bottom: 8px;
      border-bottom: 1px solid ${darkTheme.accent};
      border-radius: 0;
      padding-left: 8px;
      padding-bottom: 4px;
    }
  }

  user-select: none;
  font-weight: normal;
  font-size: 13px;
`;

export const ExplorerHeaderStyled = styled.div`
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: ${darkTheme.accent};
  padding-left: 10px;
  background: ${darkTheme.backgroundDarker};
  border-bottom: .5px solid ${darkTheme.panelBorder};
  height: 36px;
  cursor: default;

  .material-symbols-outlined {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    font-size: 16px;
    margin-right: 8px;
  }
`;