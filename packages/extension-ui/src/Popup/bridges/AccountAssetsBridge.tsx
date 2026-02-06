// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useEffect } from 'react';

import { AccountContext, GenesisHashOptionsContext, UserAddedChainContext, WorkerContext } from '@polkadot/extension-polkagate/src/components/contexts';
import { useNotifications } from '@polkadot/extension-polkagate/src/hooks';
import useAssetsBalances from '@polkadot/extension-polkagate/src/hooks/useAssetsBalances';
import useNFT from '@polkadot/extension-polkagate/src/hooks/useNFT';
import { useAppDispatch, useVariable } from '@polkadot/extension-polkagate/src/store/hooks';
import { syncAssets } from '@polkadot/extension-polkagate/src/store/thunks/assetsThunks';

export default function AccountAssetsBridge() {
    const dispatch = useAppDispatch();

    const { accounts } = useContext(AccountContext);
    const genesisHashOptions = useContext(GenesisHashOptionsContext);
    const userAddedChainCtx = useContext(UserAddedChainContext);
    const worker = useContext(WorkerContext);
    const isExtensionLocked = useVariable('extensionLock');

    useNotifications(false); // fetches and saves notification in the local storage
    useNFT(accounts); // fetches and saves NFTs in the local storage

    const assetsOnChains = useAssetsBalances(
        accounts,
        genesisHashOptions,
        userAddedChainCtx,
        worker,
        isExtensionLocked
    );

    useEffect(() => {
        if (assetsOnChains && accounts) {
            dispatch(syncAssets(assetsOnChains, accounts)).catch(console.error);
        }
    }, [accounts, assetsOnChains, dispatch]); // assetsOnChains?.timeStamp, accounts?.length, dispatch

    return null;
}
