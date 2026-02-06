// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SettingsStruct } from '@polkadot/ui-settings/types';

import { useEffect } from 'react';

import { useAppDispatch, useVariable } from '@polkadot/extension-polkagate/src/store/hooks';
import { setSettings } from '@polkadot/extension-polkagate/src/store/slices/settingsSlice';
import { getLanguageOptions } from '@polkadot/extension-polkagate/src/util/getLanguageOptions';
import uiSettings from '@polkadot/ui-settings';

export default function SettingsBridge() {
    const dispatch = useAppDispatch();
    const settings = useVariable('settings');
    const currentLang = settings.i18nLang;

    // Initial hydration + subscription
    useEffect(() => {
        const settingsChange = (settings: SettingsStruct): void => {
            dispatch(setSettings(settings));
        };

        // hydrate immediately
        dispatch(setSettings(uiSettings.get()));

        uiSettings.on('change', settingsChange);
    }, [dispatch]);

    // Default language logic
    useEffect(() => {
        if (currentLang !== 'default') {
            return;
        }

        const i18nLang = chrome.i18n.getUILanguage().split('-')[0];
        const isSupported = getLanguageOptions().some(
            ({ value }) => value === i18nLang
        );

        if (isSupported) {
            uiSettings.set({ i18nLang });
            dispatch(setSettings({ ...settings, i18nLang }));
            console.log('PolkaGate default language is set to', i18nLang);
        }
    }, [currentLang, dispatch, settings]);

    return null;
}
