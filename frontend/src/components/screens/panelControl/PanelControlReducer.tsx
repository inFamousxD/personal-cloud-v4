import React from "react";
import 'split-pane-react/esm/themes/default.css';
import {Route, Routes} from "react-router-dom";
import PanelControlEmpty from "./PanelControlEmpty";
import Notes from "../notes/Notes";

const PanelControlReducer: React.FC = () => {
    return (
        <Routes>
            <Route index element={<PanelControlEmpty />} />
            <Route path="/notes" element={<Notes />} />
        </Routes>
    )
}

export default PanelControlReducer;