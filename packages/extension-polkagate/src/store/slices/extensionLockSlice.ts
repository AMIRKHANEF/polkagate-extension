// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ExtensionLockState = boolean;

const initialState: ExtensionLockState = true;

const extensionLockSlice = createSlice({
    initialState,
    name: 'extensionLock',
    reducers: {
        setIsExtensionLocked(_state, action: PayloadAction<boolean>) {
            return action.payload;
        }
    }
});

export const { setIsExtensionLocked } = extensionLockSlice.actions;

export default extensionLockSlice.reducer;
