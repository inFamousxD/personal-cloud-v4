import React, {useEffect} from "react";
import Login from "./Login";
import Register from "./Register";
import {LoadingContainerStyled} from "./AuthContainer.styles";
import {fetchAndDecodeLocalStorageAuthToken} from "../../../authentication/localStorageAuthentication";

export type AuthContainerRenderType = {
    isLoading: boolean;
    typeName: "login" | "register";
    loadingState: string;
}

type AuthContainerPropType = {
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
}
const AuthContainer: React.FC<AuthContainerPropType> = (props) => {
    const { setIsAuthenticated } = props;

    const [renderPage, setRenderPage] = React.useState<AuthContainerRenderType>({
        isLoading: true,
        typeName: "login",
        loadingState: "Initializing"
    });

    useEffect(() => {
        setRenderPage({
            ...renderPage, loadingState: "Checking Browser Authentication"
        })
        const auth = fetchAndDecodeLocalStorageAuthToken();
        setRenderPage({
            ...renderPage, loadingState: "Decrypting Browser Authentication"
        })
        if (auth.authenticated) {
            setIsAuthenticated(true);
            setRenderPage({
                ...renderPage, loadingState: "Browser Authentication Successful", isLoading: false
            });
        } else {
            setRenderPage({
                ...renderPage, loadingState: "Browser Authentication Failed, Relaying to Login Page", isLoading: false
            });
        }
    }, [renderPage, setIsAuthenticated]);

    return (
        <>
            {
                renderPage.isLoading && <LoadingContainerStyled>
                    <div className="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                    <span> {renderPage.loadingState} </span>
                </LoadingContainerStyled>
            }
            {
                !renderPage.isLoading && renderPage.typeName === "login" &&
                    <Login renderPage={renderPage} setRenderPage={setRenderPage} />
            }
            {
                !renderPage.isLoading && renderPage.typeName === "register" &&
                    <Register renderPage={renderPage} setRenderPage={setRenderPage} />
            }
        </>
    )
}

export default AuthContainer;