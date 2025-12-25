import { createSlice } from "@reduxjs/toolkit";

const mainDockInitialState = {
    selected: null,
    dockTopOptions: [
        {
            id: "notes",
            icon: "notes",
            navigatesTo: "/notes"
        },
        {
            id: "tbd1",
            icon: "event_note",
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
            id: "server",
            icon: "dns",
            navigatesTo: "/server"
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