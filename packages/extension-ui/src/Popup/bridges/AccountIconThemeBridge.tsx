// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MyIconTheme } from '@polkadot/extension-polkagate/src/util/types';

import { useEffect } from 'react';

import { useAppDispatch } from '@polkadot/extension-polkagate/src/store/hooks';
import { setAccountIconTheme } from '@polkadot/extension-polkagate/src/store/slices/accountIconThemeSlice';
import { getAndWatchStorage } from '@polkadot/extension-polkagate/src/util';
import { DEFAULT_ACCOUNT_ICON_THEME, STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

export default function SettingsBridge() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const unsubscribe = getAndWatchStorage(
            STORAGE_KEY.ICON_THEME,
            (theme: MyIconTheme) => dispatch(setAccountIconTheme(theme)),
            false,
            DEFAULT_ACCOUNT_ICON_THEME);

        return () => unsubscribe();
    }, [dispatch]);

    return null;
}
