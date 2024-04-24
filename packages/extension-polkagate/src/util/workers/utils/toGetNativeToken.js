// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { balancify } from '.';

export async function toGetNativeToken (addresses, api, chainName) {
  const _result = {};

  const balances = await Promise.all(addresses.map((address) => api.derive.balances.all(address)));

  addresses.forEach((address, index) => {
    const totalBalance = balances[index].freeBalance.add(balances[index].reservedBalance);

    if (totalBalance.isZero()) {
      return;
    }

    _result[address] = [{
      balanceDetails: balancify(balances[index]),
      chainName,
      decimal: api.registry.chainDecimals[0],
      genesisHash: api.genesisHash.toString(),
      priceId: chainName.toLowerCase().replace('assethub', ''), // based on the fact that chains native token price id is the same as their chain names
      token: api.registry.chainTokens[0],
      totalBalance: String(totalBalance)
    }];
  });

  return _result;
}