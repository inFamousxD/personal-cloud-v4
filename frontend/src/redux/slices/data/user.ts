import {createSlice} from "@reduxjs/toolkit";

const userInitialState = {
    isLoading: false,
    isLoggedIn: false,
    userName: null,
    email: null,
    authToken: null
}

const userSlice = createSlice({
    name: 'userSlice',
    initialState: userInitialState,
    reducers: {
        login: (state, action) => {
            state.isLoading = false;
            state.isLoggedIn = action.payload.isLoggedIn;
            state.userName = action.payload.userName;
            state.email = action.payload.email;
            state.authToken = action.payload.authToken;
        }
    }
});

export default userSlice;