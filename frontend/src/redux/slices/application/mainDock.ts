import { createSlice } from "@reduxjs/toolkit";

const mainDockInitialState = {
    selected: null,
    dockTopOptions: [
        {
            id: "notes",
            icon: "add_notes",
            navigatesTo: "/notes"
        },
        {
            id: "journal",
            icon: "history_edu",
            navigatesTo: "/journal"
        },
        {
            id: "lists",
            icon: "event_list",
            navigatesTo: "/lists"
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