import { configureStore } from "@reduxjs/toolkit";
import backendReducer from './slice'

export const store = configureStore({
    reducer: {
        backend: backendReducer
    }
})