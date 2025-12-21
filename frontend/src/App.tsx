// import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleAuthWrapper } from "./contexts/AuthContext";
import ServerContainer from "./components/screens/server/ServerContainer";
import RootScreen from "./components/screens/root/RootScreen";
import Login from "./components/screens/login/Login";
import Notes from "./components/screens/notes/Notes";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <GoogleAuthWrapper>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/notes"
                        element={
                            <ProtectedRoute>
                                <Notes />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/server" element={<ServerContainer />} />
                    <Route path="/" element={<Navigate to="/notes" replace />} />
                    <Route path="*" element={<RootScreen />} />
                </Routes>
            </BrowserRouter>
        </GoogleAuthWrapper>
    );
}

export default App;