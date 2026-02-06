// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { configureStore } from '@reduxjs/toolkit';

import assetsReducer from './slices/assetsSlice';
import extensionLockReducer from './slices/extensionLockSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false // important for Polkadot objects
        }),
    reducer: {
        assets: assetsReducer,
        extensionLock: extensionLockReducer,
        settings: settingsReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
