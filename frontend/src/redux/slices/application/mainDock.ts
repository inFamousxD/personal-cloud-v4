import { createSlice } from "@reduxjs/toolkit";

const mainDockInitialState = {
    selected: null,
    dockTopOptions: [
        {
            id: "notes",
            icon: "folder",
            navigatesTo: "/notes"
        },
        {
            id: "tbd1",
            icon: "bookmark",
            navigatesTo: "/tbd1"
        },
        {
            id: "tbd2",
            icon: "search",
            navigatesTo: "/tbd2"
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