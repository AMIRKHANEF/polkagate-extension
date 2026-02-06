// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MyIconTheme } from '@polkadot/extension-polkagate/src/util/types';

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { DEFAULT_ACCOUNT_ICON_THEME } from '@polkadot/extension-polkagate/src/util/constants';

export type accountIconThemeState = MyIconTheme;

const initialState: accountIconThemeState = DEFAULT_ACCOUNT_ICON_THEME as MyIconTheme;

const accountIconThemeSlice = createSlice({
    initialState,
    name: 'accountIconTheme',
    reducers: {
        setAccountIconTheme(_state, action: PayloadAction<MyIconTheme>) {
            return action.payload;
        }
    }
});

export const { setAccountIconTheme } = accountIconThemeSlice.actions;

export default accountIconThemeSlice.reducer;
