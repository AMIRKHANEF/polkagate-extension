// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback } from 'react';

import { useEndpoint, useEndpoints, useInfo, useTranslation } from '../hooks';
import { Select } from '.';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
}

export type ChromeStorageGetResponse = {
  [key: string]: {
    [key: string]: string | undefined;
  } | undefined;
};

export default function RemoteNodeSelector ({ address, genesisHash }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { account, chainName } = useInfo(address);
  const endpointOptions = useEndpoints(genesisHash || account?.genesisHash);
  const endpoint = useEndpoint(address);

  const _onChangeEndpoint = useCallback((newEndpoint?: string | undefined): void => {
    chainName && address && chrome.storage.local.get('endpoints', (res: { endpoints?: ChromeStorageGetResponse }) => {
      const i = `${address}`;
      const j = `${chainName}`;
      const savedEndpoints: ChromeStorageGetResponse = res?.endpoints || {};

      savedEndpoints[i] = savedEndpoints[i] || {};

      savedEndpoints[i][j] = newEndpoint;

      // eslint-disable-next-line no-void
      void chrome.storage.local.set({ endpoints: savedEndpoints });
    });
  }, [address, chainName]);

  return (
    <>
      {endpoint &&
        <Select
          _mt='10px'
          label={t<string>('Remote node')}
          onChange={_onChangeEndpoint}
          options={endpointOptions}
          value={endpoint}
        />}
    </>
  );
}
