import styled from "styled-components";
import {darkTheme} from "../../../theme/dark.colors";

export const LoginStyled = styled.div`
  height: 100vh;
  background: ${darkTheme.backgroundDarkest};
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 200ms ease-in-out;
`;

export const LoginFormStyled = styled.div`
  background: ${darkTheme.backgroundDarker};

  color: ${darkTheme.text.color};
  justify-content: center;
  align-items: center;
  font-size: 20px;
  display: flex;
  flex-direction: column;
  border: 0.5px solid ${darkTheme.border};
  width: 400px;
  height: 400px;
  border-radius: 10px;
  transition: all 200ms ease-in-out;

  box-shadow: 0 0 2px ${darkTheme.border};
  
  .title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 30px;
    margin-top: 50px;
  }
  
  .create {
    margin: 8px 0 50px 0;
    font-size: 10px;
    color: ${darkTheme.accent};
  }
  
  input {
    transition: all 200ms ease-in-out;
    background: ${darkTheme.backgroundDarker};
    border: 0.5px solid ${darkTheme.border};
    height: 20px;
    margin: 10px 0;
    width: 250px;
    padding: 5px 10px;
    color: ${darkTheme.text.color};
    font-size: 15px;
    border-radius: 5px;
  }:focus{
    outline: 0.5px solid ${darkTheme.accent};
  }
  
  button {
    transition: all 200ms ease-in-out;
    background: ${darkTheme.backgroundDarker};
    border: 0.5px solid ${darkTheme.border};
    margin: 50px 0 0 0;
    color: ${darkTheme.text.color};
    padding: 10px 35px;
    border-radius: 5px;
  }
`;