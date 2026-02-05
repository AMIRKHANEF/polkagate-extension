// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TypedUseSelectorHook } from 'react-redux';
import type { AppDispatch, RootState } from './index';

import { useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const selectors = {
    accountsAssets: (state: RootState) =>
        state.assets.accountsAssets
};

export function useVariable(key: keyof typeof selectors) {
  return useSelector(selectors[key]);
}
