import React from "react";
import PanelControl from "../panelControl/PanelControl";
import NavigationContainer from "../../common/navigation/NavigationContainer";
import BottomRibbonContainer from "../../common/ribbon/BottomRibbonContainer";
import {Outlet} from "react-router-dom";

export const RootScreen: React.FC = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: "100vh" }}>
            <div className="App" style={{ display: "flex", flexDirection: "row", flex: 1 }}>
                {/* <NavigationContainer /> */}
                <PanelControl />
            </div>
            <BottomRibbonContainer></BottomRibbonContainer>
            <Outlet />
        </div>
    );
}

export default RootScreen;