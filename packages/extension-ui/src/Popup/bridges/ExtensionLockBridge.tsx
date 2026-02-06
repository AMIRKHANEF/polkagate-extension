// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect } from 'react';

import useAutoLockRefresher from '@polkadot/extension-polkagate/src/context/useAutoLockRefresher';
import { useIsPasswordMigrated } from '@polkadot/extension-polkagate/src/hooks';
import { areAccountsLocksExpired } from '@polkadot/extension-polkagate/src/messaging';
import { useAppDispatch, useVariable } from '@polkadot/extension-polkagate/src/store/hooks';
import { setIsExtensionLocked } from '@polkadot/extension-polkagate/src/store/slices/extensionLockSlice';

interface LockExpiredMessage { type: 'LOCKED_ACCOUNTS_EXPIRED' }

export default function ExtensionLockBridge() {
    const dispatch = useAppDispatch();
    const isExtensionLocked = useVariable('extensionLock');

    const isPasswordsMigrated = useIsPasswordMigrated();

    useAutoLockRefresher(isExtensionLocked);

    useEffect(() => {
        isPasswordsMigrated && areAccountsLocksExpired()
            .then((isExpired) => {
                dispatch(setIsExtensionLocked(isExpired));
            })
            .catch(console.error);

        const handleLockExpiredMessage = (msg: LockExpiredMessage) => {
            if (msg.type === 'LOCKED_ACCOUNTS_EXPIRED') {
                window.location.reload();
            }
        };

        chrome.runtime.onMessage.addListener(handleLockExpiredMessage);

        return () => chrome.runtime.onMessage.removeListener(handleLockExpiredMessage);
    }, [dispatch, isPasswordsMigrated]);

    return null; // 👈 no UI
}
