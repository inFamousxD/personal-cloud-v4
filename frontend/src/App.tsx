// import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleAuthWrapper } from "./contexts/AuthContext";
import RootScreen from "./components/screens/root/RootScreen";
import Login from "./components/screens/login/Login";

function App() {
    return (
        <GoogleAuthWrapper>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="*" element={<RootScreen />} />
                    </Routes>
                </BrowserRouter>
        </GoogleAuthWrapper>
    );
}

export default App;