import { createSlice } from "@reduxjs/toolkit";

interface DockOption {
    id: string;
    icon: string;
    navigatesTo: string;
    feature?: string; // Maps to permission feature key
}

interface MainDockState {
    selected: string | null;
    dockTopOptions: DockOption[];
    dockBottomOptions: DockOption[];
}

const mainDockInitialState: MainDockState = {
    selected: null,
    dockTopOptions: [
        {
            id: "notes",
            icon: "add_notes",
            navigatesTo: "/notes",
            feature: "notes"
        },
        {
            id: "journal",
            icon: "history_edu",
            navigatesTo: "/journal",
            feature: "journal"
        },
        {
            id: "lists",
            icon: "format_list_bulleted_add",
            navigatesTo: "/lists",
            feature: "lists"
        },
        {
            id: "drawings",
            icon: "draw",
            navigatesTo: "/drawings",
            feature: "drawings"
        },
        {
            id: "tracker",
            icon: "track_changes",
            navigatesTo: "/tracker",
            feature: "tracker"
        },
        {
            id: "agent",
            icon: "mark_unread_chat_alt",
            navigatesTo: "/agent",
            feature: "agent"  // Restricted by default
        },
        {
            id: "terminal",
            icon: "terminal",
            navigatesTo: "/terminal",
            feature: "terminal"  // Restricted by default
        }
    ],
    dockBottomOptions: [
        {
            id: "server",
            icon: "dns",
            navigatesTo: "/server",
            feature: "server"  // Restricted by default
        },
        {
            id: "settings",
            icon: "settings",
            navigatesTo: "/settings",
            feature: "settings"  // Always allowed
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