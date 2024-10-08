// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

import { createAssets } from '@polkagate/apps-config/assets';

import { getSubstrateAddress } from '../utils';
// eslint-disable-next-line import/extensions
import { balancifyAsset, closeWebsockets, fastestEndpoint, getChainEndpoints, metadataFromApi, toGetNativeToken } from './utils';

async function getAssets (addresses, assetsToBeFetched, chainName, userAddedEndpoints) {
  const endpoints = getChainEndpoints(chainName, userAddedEndpoints);
  const { api, connections } = await fastestEndpoint(endpoints);

  const result = metadataFromApi(api);

  postMessage(JSON.stringify(result));

  const results = await toGetNativeToken(addresses, api, chainName);

  const maybeTheAssetOfAddresses = addresses.map((address) => api.query.tokens.accounts.entries(address));
  const balanceOfAssetsOfAddresses = await Promise.all(maybeTheAssetOfAddresses);

  balanceOfAssetsOfAddresses.flat().forEach((entry) => {
    if (!entry.length) {
      return;
    }

    const formatted = entry[0].toHuman()[0];
    const storageKey = entry[0].toString();

    const foundAsset = assetsToBeFetched.find((_asset) => {
      const currencyId = _asset?.extras?.currencyIdScale.replace('0x', '');

      return currencyId && storageKey.endsWith(currencyId);
    });

    const balance = entry[1];
    const totalBalance = balance.free.add(balance.reserved);

    if (foundAsset) {
      const asset = {
        assetId: foundAsset.id,
        balanceDetails: balancifyAsset(balance),
        chainName,
        decimal: foundAsset.decimal,
        formatted,
        genesisHash: api.genesisHash.toString(),
        priceId: foundAsset?.priceId,
        token: foundAsset.symbol,
        totalBalance: String(totalBalance)
      };

      const address = getSubstrateAddress(formatted);

      results[address]?.push(asset) ?? (results[address] = [asset]);
    } else {
      console.log(`NOTE: There is an asset on ${chainName} for ${formatted} which is not whitelisted. assetInfo`, storageKey, balance?.toHuman());
    }
  });

  postMessage(JSON.stringify(results));
  closeWebsockets(connections);
}

onmessage = async (e) => {
  const { addresses, chainName, userAddedEndpoints } = e.data;

  const assetsChains = createAssets();
  const assetsToBeFetched = assetsChains[chainName];

  /** if assetsToBeFetched === undefined then we don't fetch assets by default at first, but wil fetch them on-demand later in account details page*/
  if (!assetsToBeFetched) {
    console.info(`getAssetOnMultiAssetChain: No assets to be fetched on ${chainName}`);

    return postMessage(undefined); // FIXME: if this happens, should be handled in caller
  }

  let tryCount = 1;

  while (tryCount >= 1 && tryCount <= 5) {
    try {
      await getAssets(addresses, assetsToBeFetched, chainName, userAddedEndpoints);

      tryCount = 0;

      return;
    } catch (error) {
      console.error(`getAssetOnMultiAssetChain: Error while fetching assets on ${chainName}, ${5 - tryCount} times to retry`, error);

      tryCount === 5 && postMessage(undefined);
    }

    tryCount++;
  }
};
