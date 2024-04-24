// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createAssets } from '@polkagate/apps-config/assets';
import { useMemo } from 'react';

import { toCamelCase } from '../fullscreen/governance/utils/util';
import { EXTRA_PRICE_IDS } from '../util/api/getPrices';
import { ASSET_HUBS } from '../util/constants';
import { Price } from '../util/types';
import { useChain, useChainName, usePrices } from '.';

const DEFAULT_PRICE = {
  price: undefined,
  priceChainName: undefined,
  priceDate: undefined
};

const assetsChains = createAssets();

/**
 *  @description retrieve the price of a token from local storage PRICES
 * @param address : accounts substrate address
 * @returns price : price of the token which the address is already switched to
 */
export default function useTokenPrice (address: string, assetId?: number): Price | typeof DEFAULT_PRICE {
  const chainName = useChainName(address);
  const chain = useChain(address);
  const isAssetHub = ASSET_HUBS.includes(chain?.genesisHash || '');

  const pricesInCurrencies = usePrices();
  const mayBeAssetsOnMultiAssetChains = assetsChains[toCamelCase(chainName || '')];

  const _assetId = assetId !== undefined
    ? assetId
    : isAssetHub
      ? 0 // zero is the native token's assetId on apps-config
      : undefined;

  return useMemo(() => {
    if (!chainName || !pricesInCurrencies) {
      return DEFAULT_PRICE;
    }

    const mayBePriceValue = pricesInCurrencies.prices?.[
      _assetId !== undefined
        ? mayBeAssetsOnMultiAssetChains?.[_assetId]?.priceId as string
        : EXTRA_PRICE_IDS[chainName?.toLocaleLowerCase()] || chainName?.toLocaleLowerCase()
    ]?.value || 0;

    return {
      price: mayBePriceValue,
      priceChainName: chainName?.toLocaleLowerCase(),
      priceDate: pricesInCurrencies.date
    };
  }, [_assetId, chainName, mayBeAssetsOnMultiAssetChains, pricesInCurrencies]);
}
