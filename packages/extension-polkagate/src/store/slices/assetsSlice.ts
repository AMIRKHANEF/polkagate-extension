// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PayloadAction } from '@reduxjs/toolkit';
import type { SavedAssets } from '@polkadot/extension-polkagate/hooks/useAssetsBalances';

import { createSlice } from '@reduxjs/toolkit';

export interface AssetsState {
    accountsAssets: SavedAssets | null;
    lastUpdated?: number;
}

const initialState: AssetsState = {
    accountsAssets: null,
    lastUpdated: undefined
};

const assetsSlice = createSlice({
    initialState,
    name: 'assets',
    reducers: {
        clearAssets(state) {
            state.accountsAssets = null;
            state.lastUpdated = undefined;
        },
        setAccountsAssets(state, action: PayloadAction<SavedAssets>) {
            state.accountsAssets = action.payload;
            state.lastUpdated = action.payload.timeStamp;
        }
    }
});

export const { clearAssets, setAccountsAssets } = assetsSlice.actions;

export default assetsSlice.reducer;
