import React from "react";
import {BottomRibbonStyled} from "./BottomRibbon.styles";

const BottomRibbon: React.FC = () => {
    return (
        <BottomRibbonStyled>
            <span className="material-symbols-outlined box">check_box_outline_blank</span>
            Bottom Ribbon
            <span className="material-symbols-outlined">chevron_right</span>
            Should Show
            <span className="material-symbols-outlined">chevron_right</span>
            Open Files
            <span className="material-symbols-outlined">chevron_right</span>
            Hierarchy
            <div style={{ flex: "auto" }}></div>
            <span className="material-symbols-outlined">summarize</span>
            Language [JavaScript]
            <span className="material-symbols-outlined">cast_connected</span>
            Connected to LocalHost:3000
            <span className="material-symbols-outlined">lock</span>
        </BottomRibbonStyled>
    )
}

export default BottomRibbon;