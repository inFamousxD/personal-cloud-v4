import React, {ChangeEvent, SetStateAction} from "react";
import {LoginFormStyled, LoginStyled} from "./Login.styles";
import {auth_login} from "../../../api/authentication";
import {LoginPOSTReturnType} from "../../../types/authTypes";
import {AppDispatch} from "../../../redux/store";
import {useDispatch} from "react-redux";
import userSlice from "../../../redux/slices/data/user";
import {AuthContainerRenderType} from "./AuthContainer";

export type LoginType = {
    renderPage: AuthContainerRenderType;
    setRenderPage: React.Dispatch<SetStateAction<AuthContainerRenderType>>;
}
const Login: React.FC<LoginType> = (props) => {
    const { renderPage, setRenderPage } = props;
    const dispatch: AppDispatch = useDispatch();

    const [loginFormData, setLoginFormData] = React.useState({
        userName: "",
        password: ""
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLoginFormData({
            ...loginFormData,
            [e.target.name]: e.target.value
        })
    }

    const handleLogin = async () => {
        const loginData: LoginPOSTReturnType = await auth_login(loginFormData);
        if (loginData.status === 200) {
            localStorage.setItem("authToken", loginData.authToken);
            dispatch(userSlice.actions.login({
                isLoggedIn: true,
                userName: loginData.userName,
                email: loginData.email,
                authToken: loginData.authToken
            }))
            window.location.reload();
        }
    }

    const handleSwitchToRegister = () => {
        setRenderPage({ ...renderPage, typeName: "register" })
    }

    return (
        <LoginStyled>
            <LoginFormStyled>
                <div className={"title"}>Login</div>
                <input name={"userName"} type={"text"} value={loginFormData.userName} onChange={handleChange} placeholder={"username"} />
                <input name={"password"} type={"password"} value={loginFormData.password} onChange={handleChange} placeholder={"password"} />
                <div style={{ flex: "auto" }}></div>
                <div>
                    <button onClick={handleLogin}>Login</button>
                </div>
                <div onClick={handleSwitchToRegister} className={"create"}>Create an account</div>
            </LoginFormStyled>
        </LoginStyled>
    )
}

export default Login;