// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';

import { useCallback, useContext, useMemo } from 'react';

import { AccountsAssetsContext } from '../components';
import { amountToHuman } from '../util/utils';
import { usePrices } from '.';

export interface YouHaveType {
  portfolio: number,
  date: number
}

/**
 * @description
 *  returns all user portfolio balance in selected currency
 * @returns null: means not balance found, undefined: when still work in progress, and number indicating user balance in selected currency
 */
export default function useYouHave (): YouHaveType | undefined | null {
  const pricesInCurrencies = usePrices();
  const { accountsAssets } = useContext(AccountsAssetsContext);

  const calPrice = useCallback(
    (assetPrice: number | undefined, balance: BN, decimal: number) =>
      parseFloat(amountToHuman(balance, decimal)) * (assetPrice ?? 0)
    , []);

  const youHave = useMemo(() => {
    if (!accountsAssets?.balances) {
      return null;
    }

    if (!pricesInCurrencies) {
      return undefined;
    }

    let totalPrice = 0;
    const balances = accountsAssets.balances;
    const date = Math.min(accountsAssets.timeStamp, pricesInCurrencies.date);

    Object.keys(balances).forEach((address) => {
      Object.keys(balances?.[address]).forEach((genesisHash) => {
        balances?.[address]?.[genesisHash].forEach((asset) => {
          totalPrice += calPrice(pricesInCurrencies.prices[asset.priceId]?.value ?? 0, asset.totalBalance, asset.decimal);
        });
      });
    });

    return { date, portfolio: totalPrice } as unknown as YouHaveType;
  }, [accountsAssets, calPrice, pricesInCurrencies]);

  return youHave;
}
