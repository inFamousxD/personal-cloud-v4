import {configureStore} from "@reduxjs/toolkit";
import userSlice from "./slices/data/user";
import mainDockSlice from "./slices/application/mainDock";

const store = configureStore({
    reducer: {
        user: userSlice.reducer,
        mainDock: mainDockSlice.reducer,
    }
});

export default store;
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch