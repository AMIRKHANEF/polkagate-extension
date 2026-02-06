// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MyIconTheme } from '@polkadot/extension-polkagate/src/util/types';

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { DEFAULT_ACCOUNT_ICON_THEME } from '@polkadot/extension-polkagate/src/util/constants';

export interface accountIconThemeState {
    accountIconTheme: MyIconTheme;
}

const initialState: accountIconThemeState = {
    accountIconTheme: DEFAULT_ACCOUNT_ICON_THEME
};

const accountIconThemeSlice = createSlice({
    initialState,
    name: 'accountIconTheme',
    reducers: {
        setAccountIconTheme(state, action: PayloadAction<MyIconTheme>) {
            state.accountIconTheme = action.payload;
        }
    }
});

export const { setAccountIconTheme } = accountIconThemeSlice.actions;

export default accountIconThemeSlice.reducer;
