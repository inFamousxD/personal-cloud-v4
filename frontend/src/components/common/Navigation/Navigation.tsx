import React from 'react';
import {NavigationInterface} from "./Navigation.types";
import NavigationDock from "./NavigationDock";

const Navigation: React.FC<NavigationInterface> = (props) => {
    // const {} = props;
    return (
        <NavigationDock />
    );
}

export default Navigation;