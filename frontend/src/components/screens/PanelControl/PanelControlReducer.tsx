import React from "react";
import 'split-pane-react/esm/themes/default.css';
import ExplorerListContainer from "../DockPanelComponents/Explorer/ExplorerListContainer";
import {Route, Routes} from "react-router-dom";
import PanelControlEmpty from "./PanelControlEmpty";

const PanelControlReducer: React.FC = () => {
    return (
        <>
            <Routes>
                <Route index element={<PanelControlEmpty />} />
                <Route path={"explorer"} element={<ExplorerListContainer />} />
            </Routes>
        </>
    )
}

export default PanelControlReducer;