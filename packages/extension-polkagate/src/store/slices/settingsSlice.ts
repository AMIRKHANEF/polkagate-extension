// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SettingsStruct } from '@polkadot/ui-settings/types';

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import uiSettings from '@polkadot/ui-settings';

export type SettingsState = SettingsStruct;

const initialState: SettingsState = uiSettings.get();

const settingsSlice = createSlice({
    initialState,
    name: 'settings',
    reducers: {
        setSettings(_state, action: PayloadAction<SettingsStruct>) {
            return action.payload;
        }
    }
});

export const { setSettings } = settingsSlice.actions;

export default settingsSlice.reducer;
