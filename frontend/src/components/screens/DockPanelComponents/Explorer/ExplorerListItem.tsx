import React from 'react';
import {ExplorerDirectoriesListItemType} from "../../ContentPanel/ContentPanel.types";
import {ExplorerListItemStyled} from "./ExplorerPanelComponent.styled";
import {AppDispatch} from "../../../../redux/store";
import {useDispatch} from "react-redux";
import explorerSlice from "../../../../redux/slices/data/explorer";

type DirectoriesListItemType = {
    data: ExplorerDirectoriesListItemType,
    depth: number,
    selected: string,
}
const ExplorerListItem:React.FC<DirectoriesListItemType> = (props) => {
    const { data, depth } = props;

    const [displayChildren, setDisplayChildren] = React.useState<boolean>(false);
    const dispatch: AppDispatch = useDispatch();

    return (
        <ExplorerListItemStyled $depth={depth} $hasChildren={data.children !== undefined} $isSelected={data.id === props.selected}>
            <div onClick={() => {
                dispatch(explorerSlice.actions.updateSelected({ selected: data.id }));
            }} onDoubleClick={() => {
                data.children && setDisplayChildren(!displayChildren)
            }} className={"item-name-block"}>
                {displayChildren && <div onClick={() => {
                    setDisplayChildren(!displayChildren)
                }} className="material-symbols-outlined"> expand_more </div>}
                {!displayChildren && <div onClick={() => {
                    setDisplayChildren(!displayChildren)
                }} className="material-symbols-outlined expand-icon"> chevron_right </div>}
                {
                    !data.children && <div className="material-symbols-outlined type-icon"> article </div>
                }
                {
                    data.children && <div className="material-symbols-outlined type-icon"> folder </div>
                }
                <div className={"item-name"}>{ data.name }</div>
            </div>
            {
                displayChildren && data.children && data.children.map(item => {
                    return <ExplorerListItem key={item.name} data={item} depth={depth+1} selected={props.selected} />
                })
            }
        </ExplorerListItemStyled>
    );
}

export default ExplorerListItem;