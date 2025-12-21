import {ExplorerDirectoriesDataType} from "../../ContentPanel/ContentPanel.types";
import React from "react";
import ExplorerListItem from "./ExplorerListItem";
import {ExplorerHeaderStyled} from "./ExplorerPanelComponent.styled";
import {useSelector} from "react-redux";
import {RootState} from "../../../../redux/store";

const ExplorerList: React.FC<ExplorerDirectoriesDataType> = (props) => {
    const { children, name } = props;
    const selected = useSelector((state: RootState) => state.explorer.metadata.selected);

    return (
        <div style={{ marginBottom: '30vh' }}>
            <ExplorerHeaderStyled>
                <div className="material-symbols-outlined">
                    book_4
                </div>
                <div className={"item-name-block title"}>
                    { name }
                </div>
                <div style={{ flex: 'auto' }}></div>
                <div className="material-symbols-outlined">
                    new_window
                </div>
                <div className="material-symbols-outlined">
                    create_new_folder
                </div>
                <div className="material-symbols-outlined">
                    more_vert
                </div>
            </ExplorerHeaderStyled>
            {
                children && children.map(item => {
                    return <ExplorerListItem key={item.name} data={item} depth={0} selected={selected}/>
                })
            }
        </div>
    )
}

export default ExplorerList;