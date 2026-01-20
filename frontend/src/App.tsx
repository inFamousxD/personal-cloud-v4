import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleAuthWrapper } from "./contexts/AuthContext";
import { PermissionsProvider } from "./contexts/PermissionsContext";
import RootScreen from "./components/screens/root/RootScreen";
import Login from "./components/screens/login/Login";
import SharedList from "./components/screens/lists/SharedList";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
    return (
        <ThemeProvider>
            <GoogleAuthWrapper>
                <PermissionsProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/lists/shared/:shareId" element={<SharedList />} />
                            <Route path="*" element={<RootScreen />} />
                        </Routes>
                    </BrowserRouter>
                </PermissionsProvider>
            </GoogleAuthWrapper>
        </ThemeProvider>
    );
}

export default App;