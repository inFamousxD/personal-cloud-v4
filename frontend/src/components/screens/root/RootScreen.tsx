import React from "react";
// import PanelControl from "../panelControl/PanelControl";
import NavigationContainer from "../../common/navigation/NavigationContainer";
import BottomRibbonContainer from "../../common/ribbon/BottomRibbonContainer";
import {Outlet, Route, Routes} from "react-router-dom";
import Notes from "../notes/Notes";
import ProtectedRoute from "../../ProtectedRoute";

export const RootScreen: React.FC = () => {
    return (
        <ProtectedRoute>
            <div style={{ display: 'flex', flexDirection: 'column', height: "100vh" }}>
                <div className="App" style={{ display: "flex", flexDirection: "row", flex: 1 }}>
                    <NavigationContainer />
                    {/* <PanelControl /> */}
                    <Routes>
                        {/* <Route index element={<PanelControlEmpty />} /> */}
                        <Route path="/notes" element={<Notes />} />
                    </Routes>
                </div>
                <BottomRibbonContainer></BottomRibbonContainer>
                <Outlet />
            </div>
        </ProtectedRoute>
    );
}

export default RootScreen;