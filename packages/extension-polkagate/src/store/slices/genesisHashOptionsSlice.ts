// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PayloadAction } from '@reduxjs/toolkit';
import type { DropdownOption } from '@polkadot/extension-polkagate/src/util/types';

import { createSlice } from '@reduxjs/toolkit';

export type GenesisHashOptionsState = DropdownOption[];

const initialState: GenesisHashOptionsState = [];

const genesisHashOptionsSlice = createSlice({
  initialState,
  name: 'genesisHashOptions',
  reducers: {
    setGenesisHashOptions(_state, action: PayloadAction<GenesisHashOptionsState>) {
      return action.payload;
    }
  }
});

export const { setGenesisHashOptions } = genesisHashOptionsSlice.actions;

export default genesisHashOptionsSlice.reducer;
