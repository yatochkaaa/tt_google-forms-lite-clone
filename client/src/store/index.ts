import { configureStore } from "@reduxjs/toolkit";
import { api } from "./baseApi";

export const store = configureStore({
  reducer: {
    api: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
