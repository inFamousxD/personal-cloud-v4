import styled from "styled-components"
import { theme } from "../../../themes/dark.theme";

export type IconType = {
  data: {
    icon: string
  }
}

const IconStyled = styled.span`
  color: ${theme.primary};
  cursor: pointer;
  user-select: none;
  padding: 8px;
`;

const Icon:React.FC<IconType> = (props) => {
  const { data } = props;
  return (
    <IconStyled style={{ fontWeight: '200' }} className="material-symbols-outlined">{data.icon}</IconStyled>
  )
}

export default Icon