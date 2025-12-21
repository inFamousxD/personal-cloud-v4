import React from "react";
import PanelControl from "../PanelControl/PanelControl";
import Navigation from "../../common/Navigation/Navigation";
import BottomRibbonContainer from "../../common/BottomRibbon/BottomRibbonContainer";
import {Outlet} from "react-router-dom";

export const RootScreen: React.FC = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: "100vh" }}>
            <div className="App" style={{ display: "flex", flexDirection: "row", flex: 1 }}>
                <Navigation />
                <PanelControl />
                <Navigation />
            </div>
            <BottomRibbonContainer></BottomRibbonContainer>
            <Outlet />
        </div>
    );
}

export default RootScreen;