import { configureStore } from '@reduxjs/toolkit';
import { aisleAuraApi } from './aisle-aura.ts';

export const store = configureStore({
    reducer: {
        [aisleAuraApi.reducerPath]: aisleAuraApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }).concat(aisleAuraApi.middleware),
});
