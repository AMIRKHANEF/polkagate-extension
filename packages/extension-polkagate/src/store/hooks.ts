// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TypedUseSelectorHook } from 'react-redux';
import type { AppDispatch, RootState } from './index';

import { useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const selectors = {
  accountIconTheme: (state: RootState) => state.accountIconTheme,

  accountsAssets: (state: RootState) => state.assets.accountsAssets,

  extensionLock: (state: RootState) => state.extensionLock,

  genesisHashOptions: (state: RootState) => state.genesisHashOptions,

  settings: (state: RootState) => state.settings
} as const;

export function useVariable<K extends keyof typeof selectors>(key: K): ReturnType<typeof selectors[K]> {
  return useSelector(selectors[key] as (state: RootState) => ReturnType<typeof selectors[K]>);
}
