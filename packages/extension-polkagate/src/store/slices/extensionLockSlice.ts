// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ExtensionLockState {
    isExtensionLocked: boolean;
}

const initialState: ExtensionLockState = {
    isExtensionLocked: true
};

const extensionLockSlice = createSlice({
    initialState,
    name: 'extensionLock',
    reducers: {
        setIsExtensionLocked(state, action: PayloadAction<boolean>) {
            state.isExtensionLocked = action.payload;
        }
    }
});

export const { setIsExtensionLocked } = extensionLockSlice.actions;

export default extensionLockSlice.reducer;
