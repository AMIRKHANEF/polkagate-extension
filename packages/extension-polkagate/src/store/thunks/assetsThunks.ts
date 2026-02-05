// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SavedAssets } from '@polkadot/extension-polkagate/hooks/useAssetsBalances';
import type { AppDispatch, RootState } from '../index';

import { setStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

import { setAccountsAssets } from '../slices/assetsSlice';

export const syncAssets =
    (assetsOnChains: SavedAssets, accounts: { address: string }[]) =>
        async(dispatch: AppDispatch, _getState: () => RootState) => {
            if (!assetsOnChains?.balances) {
                return;
            }

            const updatedBalances = { ...assetsOnChains.balances };

            Object.keys(updatedBalances).forEach((address) => {
                const exists = accounts.some((a) => a.address === address);

                if (!exists) {
                    delete updatedBalances[address];
                }
            });

            const updated: SavedAssets = {
                ...assetsOnChains,
                balances: updatedBalances
            };

            dispatch(setAccountsAssets(updated));

            try {
                await setStorage(STORAGE_KEY.ASSETS, updated, true);
            } catch (e) {
                console.error(e);
            }
        };
