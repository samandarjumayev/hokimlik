import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    sidebar: false,
    menu: true,
    isAuth: !!localStorage.getItem('access'),
    access: localStorage.getItem('access') || null,
    refresh: localStorage.getItem('refresh') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    role: localStorage.getItem('role') || null,
    id: localStorage.getItem('id') || null,
    service_id: localStorage.getItem('service_id') || null,
    // role: "super_admin",
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.sidebar = !state.sidebar
        },
        toggleMenu: (state) => {
            state.menu = !state.menu
        },
        login: (state, action) => {
            const { access, refresh, user, role, id, service_id } = action.payload;
            state.isAuth = true;
            state.access = access;
            state.refresh = refresh;
            state.user = user;
            state.role = role;
            state.id = id;

            localStorage.setItem('access', access);
            localStorage.setItem('refresh', refresh);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('role', role);
            localStorage.setItem('id', id);
            localStorage.setItem('service_id', service_id);
        },
        logout: (state) => {
            state.isAuth = false;
            state.access = null;
            state.refresh = null;
            state.user = null;
            state.role = null;
            state.id = null;

            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            localStorage.removeItem('user');
            localStorage.removeItem('role');
            localStorage.removeItem('id');
            localStorage.removeItem('service_id');
        } 
    }
})

export const { toggleSidebar, toggleMenu, login, logout } = userSlice.actions;
export default userSlice.reducer;