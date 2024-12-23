import styled from "styled-components";
import { theme } from "../../../themes/dark.theme";

export const NavbarContainerStyled = styled.div`
  background-color: ${theme.background};
  height: 100vh;
  border-right: 1px solid ${theme.primary};
`;

export const NavbarStyled = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const NavbarItemStyled = styled.div``;