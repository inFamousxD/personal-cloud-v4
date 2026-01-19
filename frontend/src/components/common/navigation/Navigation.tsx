import React, { useEffect, useMemo } from 'react';
import { MobileNavFixed, MobileNavScrollable, MobileNavWrapper, NavigationDockStyled } from "./Navigation.styles";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import mainDock from "../../../redux/slices/application/mainDock";
import { usePermissions } from "../../../contexts/PermissionsContext";

interface DockOption {
    id: string;
    icon: string;
    navigatesTo: string;
    feature?: string; // Maps to permission feature key
}

const NavigationDock: React.FC = () => {
    const navigate = useNavigate();
    const topOptions = useSelector((state: RootState) => state.mainDock.dockTopOptions) as DockOption[];
    const bottomOptions = useSelector((state: RootState) => state.mainDock.dockBottomOptions) as DockOption[];
    const selectedOption = useSelector((state: RootState) => state.mainDock.selected);
    const dispatch: AppDispatch = useDispatch();
    const { hasAccess, isAdmin, isLoading } = usePermissions();

    const dockOptionOnClick = (navigateTo: string, id: string) => {
        dispatch(mainDock.actions.selectFromDock({ selected: id }));
        navigate(navigateTo);
    }

    const location = useLocation();

    useEffect(() => {
        dispatch(mainDock.actions.selectFromDock({ selected: location.pathname.split('/')[1] }))
    }, [location, dispatch])

    // Filter options based on permissions
    const filteredTopOptions = useMemo(() => {
        if (isLoading) return [];
        return topOptions.filter(option => {
            if (!option.feature) return true; // No feature restriction
            return hasAccess(option.feature);
        });
    }, [topOptions, hasAccess, isLoading]);

    const filteredBottomOptions = useMemo(() => {
        if (isLoading) return [];
        return bottomOptions.filter(option => {
            if (!option.feature) return true;
            // Special case: admin page only for admins
            if (option.id === 'admin') return isAdmin;
            return hasAccess(option.feature);
        });
    }, [bottomOptions, hasAccess, isAdmin, isLoading]);

    // Check if mobile
    const isMobile = window.innerWidth <= 768;

    if (isLoading) {
        return <NavigationDockStyled />;
    }

    if (isMobile) {
        return (
            <NavigationDockStyled>
                <MobileNavWrapper>
                    <MobileNavScrollable>
                        {filteredTopOptions.map(option => (
                            <div
                                key={option.id}
                                className={"material-symbols-outlined"}
                                id={(selectedOption === option.id ? "" : "un") + "selected"}
                                onClick={() => {dockOptionOnClick(option.navigatesTo, option.id);}}>
                                {option.icon}
                            </div>
                        ))}
                    </MobileNavScrollable>
                    <MobileNavFixed>
                        {filteredBottomOptions.map(option => (
                            <div
                                key={option.id}
                                className={"material-symbols-outlined"}
                                id={(selectedOption === option.id ? "" : "un") + "selected"}
                                onClick={() => {dockOptionOnClick(option.navigatesTo, option.id);}}>
                                {option.icon}
                            </div>
                        ))}
                    </MobileNavFixed>
                </MobileNavWrapper>
            </NavigationDockStyled>
        );
    }

    return (
        <NavigationDockStyled>
            {
                filteredTopOptions.map(option => {
                    return (
                        <div
                            key={option.id}
                            className={"material-symbols-outlined"}
                            id={(selectedOption === option.id ? "" : "un") + "selected"}
                            onClick={() => {dockOptionOnClick(option.navigatesTo, option.id);}}>
                            {option.icon}
                        </div>
                    )
                })
            }
            <div style={{ flex: 'auto' }} ></div>
            {
                filteredBottomOptions.map(option => {
                    return (
                        <div
                            key={option.id}
                            className={"material-symbols-outlined"}
                            id={(selectedOption === option.id ? "" : "un") + "selected"}
                            onClick={() => {dockOptionOnClick(option.navigatesTo, option.id);}}>
                            {option.icon}
                        </div>
                    )
                })
            }
        </NavigationDockStyled>
    )
}

export default NavigationDock;