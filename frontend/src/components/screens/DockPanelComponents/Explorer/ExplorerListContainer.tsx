import React, {useEffect} from "react";
import {DrawerListContainerStyled} from "../../ContentPanel/ContentPanel.styles";
import ExplorerList from "./ExplorerList";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../../redux/store";
import {LoadingContainerStyled} from "../../Login/AuthContainer.styles";
import explorerSlice from "../../../../redux/slices/data/explorer";
import {dataSample} from "./data.json";

export const ExplorerListContainer: React.FC = () => {
    const data = useSelector((state: RootState) => state.explorer.data);
    const isLoading = useSelector((state: RootState) => state.explorer.metadata.isLoading);

    const dispatch: AppDispatch = useDispatch();

    useEffect(() => {
        if (isLoading) {
            setTimeout(() => {
                dispatch(explorerSlice.actions.load({
                    data: {
                        name: 'Test',
                        children: dataSample
                    },
                    metadata: {
                        isLoading: false,
                        disableSelection: false,
                        selected: "",
                    }
                }))
            }, 2000)
        }
    }, [isLoading, dispatch]);

    return (
        <DrawerListContainerStyled>
            {
                isLoading && <LoadingContainerStyled>
                    <div className="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                    <span>Fetching Directories</span>
                </LoadingContainerStyled>
            }
            {
                !isLoading && <ExplorerList name={data.name} children={data.children} />
            }
            {/*<Outlet />*/}
        </DrawerListContainerStyled>
    )
}

export default ExplorerListContainer;