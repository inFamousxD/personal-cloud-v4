import React, {useState} from "react";
import SplitPane, {Pane} from "split-pane-react";
import 'split-pane-react/esm/themes/default.css';
import ContentPanel from "../ContentPanel/ContentPanel";
import PanelControlReducer from "./PanelControlReducer";

const PanelControl: React.FC = () => {
    const [sizes, setSizes] = useState([100, '30%', 'auto']);

    return (
        <SplitPane sashRender={() => null} sizes={sizes} split={"vertical"} onChange={setSizes}>
            <Pane minSize={250}>
                <PanelControlReducer />
            </Pane>
            <ContentPanel />
        </SplitPane>
    )
}

export default PanelControl;