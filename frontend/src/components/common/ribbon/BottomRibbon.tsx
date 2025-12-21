import React from "react";
import {BottomRibbonStyled} from "./BottomRibbon.styles";

const API_URL = import.meta.env.VITE_API_URL;

const BottomRibbon: React.FC = () => {
    return (
        <BottomRibbonStyled>
            <span className="material-symbols-outlined box">check_box_outline_blank</span>
            Bottom Ribbon
            <span className="material-symbols-outlined">chevron_right</span>
            PlaceHolder
            <div style={{ flex: "auto" }}></div>
            <span className="material-symbols-outlined">cast_connected</span>
            Connected to { API_URL.replace('http://', '').replace('https://', '').replace(':', ' | ').toUpperCase() }
            <span className="material-symbols-outlined">lock</span>
        </BottomRibbonStyled>
    )
}

export default BottomRibbon;