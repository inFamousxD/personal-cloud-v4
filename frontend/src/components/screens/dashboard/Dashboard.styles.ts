import styled from "styled-components";
import { theme } from "../../../themes/dark.theme";

export const DashboardContainerStyled = styled.div`
  width: 100%;
  height: 100vh;
`;

export const DashboardStyled = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${theme. background_secondary};
  color: ${theme.primary};
`;