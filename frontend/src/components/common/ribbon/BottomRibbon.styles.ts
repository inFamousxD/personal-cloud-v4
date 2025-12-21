import styled from "styled-components";
import {darkTheme} from "../../../theme/dark.colors";

export const BottomRibbonStyled = styled.div`
  background: ${darkTheme.backgroundDarkest};
  flex: 1;
  font-size: 12px;
  display: flex;
  justify-content: flex-start;
  vertical-align: middle;
  align-items: center;
  //margin-left: 20px;

  .material-symbols-outlined {
    &.box{
        font-size: 9px;
        font-variation-settings: 'FILL' 1, 'wght' 800, 'GRAD' 0, 'opsz' 24;
        margin: 0 10px 0 0;
        color: ${darkTheme.accent};
    }
    font-size: 14px;
    font-variation-settings: 'FILL' 0, 'wght' 800, 'GRAD' 0, 'opsz' 24;
    margin: 0 10px;
    color: ${darkTheme.accent};
  }
`;

export const BottomRibbonContainerStyled = styled.div`
  flex: 1;
  height: 24px;
  max-height: 24px;
  background: ${darkTheme.backgroundDarkest};
  border-top: 0.5px solid ${darkTheme.border};
  padding: 0 0 0 10px;
  color: ${darkTheme.text.color};
  font-size: ${darkTheme.text.fontSize};
  font-weight: ${darkTheme.text.fontWeightSemiBold};
  display: flex;
  align-items: center;
`;