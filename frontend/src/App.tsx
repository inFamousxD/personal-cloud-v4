// import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ServerContainer from "./components/screens/server/ServerContainer";
import RootScreen from "./components/screens/root/RootScreen";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/server" element={<ServerContainer />} />
          <Route path="*" element={<RootScreen />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;