import React, {ChangeEvent, SetStateAction} from "react";
import {LoginFormStyled, LoginStyled} from "./Login.styles";
import {auth_login} from "../../../api/authentication";
import {LoginPOSTReturnType} from "../../../types/authTypes";
import {AuthContainerRenderType} from "./AuthContainer";

export type RegisterType = {
    renderPage: AuthContainerRenderType;
    setRenderPage: React.Dispatch<SetStateAction<AuthContainerRenderType>>;
}
const Register: React.FC<RegisterType> = (props) => {
    const [registerFormData, setRegisterFormData] = React.useState({
        userName: "",
        password: ""
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setRegisterFormData({
            ...registerFormData,
            [e.target.name]: e.target.value
        })
    }

    const handleRegister = async () => {
        const registerData: LoginPOSTReturnType = await auth_login(registerFormData);
        if (registerData.status === 200) {
        }
    }

    return (
        <LoginStyled>
            <LoginFormStyled>
                <div className={"title"}>Register</div>
                <input name={"userName"} type={"text"} value={registerFormData.userName} onChange={handleChange} placeholder={"username"} />
                <input name={"password"} type={"password"} value={registerFormData.password} onChange={handleChange} placeholder={"password"} />
                <div style={{ flex: "auto" }}></div>
                <div>
                    <button onClick={handleRegister}>Register</button>
                </div>
                <div className={"create"}></div>
            </LoginFormStyled>
        </LoginStyled>
    )
}

export default Register;