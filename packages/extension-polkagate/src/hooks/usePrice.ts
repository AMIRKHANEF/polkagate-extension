// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useEffect, useState } from 'react';

import { AccountContext } from '../components';
import { updateMeta } from '../messaging';
import { getPrice } from '../util/api/getPrice';
import { MILLISECONDS_TO_UPDATE } from '../util/constants';
import { Price, TokenPrice } from '../util/types';
import { useApi, useChain } from '.';

export default function usePrice(address: string): Price | undefined {
  const { accounts } = useContext(AccountContext);
  const [price, setPrice] = useState<Price | undefined>();
  const [newPrice, setNewPrice] = useState<Price | undefined>();
  const api = useApi(address);
  const chain = useChain(address);
  const chainName = chain && chain.name.replace(' Relay Chain', '').toLocaleLowerCase();
  const token = api && api.registry.chainTokens[0];

  useEffect(() => {
    if (!chain || !token || !chainName) {
      return;
    }

    getPrice(chain).then((p) => {
      setNewPrice({ amount: p, token });
    }).catch(console.error);
  }, [chain, chainName, token]);

  useEffect(() => {
    if (newPrice === undefined || !chainName) {
      return;
    }

    const savedPrice = JSON.parse(accounts?.find((acc) => acc.address === address)?.price ?? '{}') as TokenPrice;

    savedPrice[chainName] = { ...newPrice, date: Date.now() };

    const metaData = JSON.stringify({ ['price']: JSON.stringify(savedPrice) });

    updateMeta(address, metaData).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts?.length, address, api, chain, newPrice]);

  useEffect(() => {
    if (!chainName) {
      return;
    }

    const savedPrice = JSON.parse(accounts?.find((acc) => acc.address === address)?.price ?? '{}') as TokenPrice;

    if (savedPrice[chainName]) {
      if (Date.now() - savedPrice[chainName]?.date < MILLISECONDS_TO_UPDATE) {
        setPrice({ chainName, amount: savedPrice[chainName].amount, token: savedPrice[chainName].token });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts?.length, address, chainName]);

  return newPrice ?? price;
}