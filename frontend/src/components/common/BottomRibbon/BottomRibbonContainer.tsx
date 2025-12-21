import React from "react";
import BottomRibbon from "./BottomRibbon";
import {BottomRibbonContainerStyled} from "./BottomRibbon.styles";

const BottomRibbonContainer: React.FC = () => {
    return (
        <BottomRibbonContainerStyled>
            <BottomRibbon></BottomRibbon>
        </BottomRibbonContainerStyled>
    )
}

export default BottomRibbonContainer;