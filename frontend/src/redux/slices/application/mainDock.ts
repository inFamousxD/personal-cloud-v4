import { createSlice } from "@reduxjs/toolkit";

const mainDockInitialState = {
    selected: null,
    dockTopOptions: [
        {
            id: "explorer",
            icon: "folder",
            navigatesTo: "/explorer"
        },
        {
            id: "bookmarks",
            icon: "bookmark",
            navigatesTo: "/bookmarks"
        },
        {
            id: "search",
            icon: "search",
            navigatesTo: "/search"
        }
    ],
    dockBottomOptions: [
        {
            id: "network_ping",
            icon: "network_ping",
            navigatesTo: "/network_ping"
        },
        {
            id: "settings",
            icon: "settings",
            navigatesTo: "/settings"
        }
    ]
}

const mainDockSlice = createSlice({
    name: "mainDockSlice",
    initialState: mainDockInitialState,
    reducers: {
        selectFromDock: (state, action) => {
            state.selected = action.payload.selected;
        }
    }
});

export default mainDockSlice;