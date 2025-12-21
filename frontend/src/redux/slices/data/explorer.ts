import {createSlice} from "@reduxjs/toolkit";
import {
    ExplorerDirectoriesPaneInterface
} from "../../../components/screens/ContentPanel/ContentPanel.types";


const explorerInitialState: ExplorerDirectoriesPaneInterface = {
    metadata: {
        disableSelection: false,
        selected: "",
        isLoading: true,
        xyz: ""
    },
    data: {
        name: "ROOT_PROJECT",
        type: undefined,
        createdOn: undefined,
        children: undefined
    }
}

const explorerSlice = createSlice({
    name: 'explorerSlice',
    initialState: explorerInitialState,
    reducers: {
        load: (state, action) => {
            state.data = action.payload.data;
            state.metadata = action.payload.metadata;
        },
        updateSelected: (state, action) => {
            state.metadata.selected = action.payload.selected
        }
    }
});

export default explorerSlice;