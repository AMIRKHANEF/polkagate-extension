// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SettingsStruct } from '@polkadot/ui-settings/types';

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import uiSettings from '@polkadot/ui-settings';

export interface SettingsState {
    settings: SettingsStruct;
}

const initialState: SettingsState = {
    settings: uiSettings.get()
};

const settingsSlice = createSlice({
    initialState,
    name: 'settings',
    reducers: {
        setSettings(state, action: PayloadAction<SettingsStruct>) {
            state.settings = action.payload;
        }
    }
});

export const { setSettings } = settingsSlice.actions;

export default settingsSlice.reducer;
