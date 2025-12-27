import React from "react";
import {BottomRibbonStyled} from "./BottomRibbon.styles";
import { useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const BottomRibbon: React.FC = () => {
    const location = useLocation();

    return (
        <BottomRibbonStyled>
            <span className="material-symbols-outlined box">check_box_outline_blank</span>
            { location.pathname === '/' ? "Home" : location.pathname.split("/")[1].toUpperCase() }
            {
                location.pathname.split("/").length > 2 &&
                <>
                    <span className="material-symbols-outlined">chevron_right</span>
                    { location.pathname.split("/")[2] }
                </>
            }
            <div style={{ flex: "auto" }}></div>
            <span className="material-symbols-outlined">cast_connected</span>
            Connected to { API_URL.replace('http://', '').replace('https://', '').replace(':', ' | ').toUpperCase() }
            <span className="material-symbols-outlined">lock</span>
        </BottomRibbonStyled>
    )
}

export default BottomRibbon;