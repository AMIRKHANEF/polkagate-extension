// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AnimatePresence } from 'framer-motion';
import React from 'react';
import { Provider } from 'react-redux';

import { Loading } from '@polkadot/extension-polkagate/src/components';
import { store } from '@polkadot/extension-polkagate/src/store';

import AccountAssetsBridge from './bridges/AccountAssetsBridge';
import ExtensionLockBridge from './bridges/ExtensionLockBridge';
import PricesProvider from './contexts/PricesProvider';
import SelectedProvider from './contexts/SelectedProvider';
import AppRoutes from './routes/RouteDefinitions';
import { AccountIconThemeProvider, AccountProvider, ActionProvider, AlertProvider, ApiProvider, CurrencyProvider, FetchingProvider, GenesisHashOptionsProvider, MediaProvider, ReferendaProvider, RequestsProvider, SettingsProvider, UserAddedChainsProvider, WorkerProvider } from './contexts';

export default function Popup(): React.ReactElement {
  return (
    <AnimatePresence mode='wait'>
      <Provider store={store}>
        <ExtensionLockBridge />
        <ActionProvider>
          <SettingsProvider>
            <AccountIconThemeProvider>
              <GenesisHashOptionsProvider>
                <WorkerProvider>
                  <AccountProvider>
                    <ApiProvider>
                      <AlertProvider>
                        <FetchingProvider>
                          <CurrencyProvider>
                            <PricesProvider>
                              <ReferendaProvider>
                                <RequestsProvider>
                                  <MediaProvider>
                                    <UserAddedChainsProvider>
                                      <SelectedProvider>
                                        <AccountAssetsBridge />
                                        <Loading>
                                          <AppRoutes />
                                        </Loading>
                                      </SelectedProvider>
                                    </UserAddedChainsProvider>
                                  </MediaProvider>
                                </RequestsProvider>
                              </ReferendaProvider>
                            </PricesProvider>
                          </CurrencyProvider>
                        </FetchingProvider>
                      </AlertProvider>
                    </ApiProvider>
                  </AccountProvider>
                </WorkerProvider>
              </GenesisHashOptionsProvider>
            </AccountIconThemeProvider>
          </SettingsProvider>
        </ActionProvider>
      </Provider>
    </AnimatePresence>
  );
}
