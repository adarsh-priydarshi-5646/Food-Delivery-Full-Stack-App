import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import ownerSlice from "./ownerSlice";
import mapSlice from "./mapSlice";

export const store = configureStore({
  reducer: {
    user: userSlice,
    owner: ownerSlice,
    map: mapSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore socket.io instance in Redux state
        ignoredActions: ['user/setSocket'],
        ignoredPaths: ['user.socket'],
      },
    }),
});
