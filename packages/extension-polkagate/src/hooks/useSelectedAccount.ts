// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { useContext, useMemo } from 'react';

import { AccountContext } from '../components';

export default function useSelectedAccount (): AccountJson | undefined {
  const { accounts } = useContext(AccountContext);

  return useMemo(() => {
    let selected = accounts.find(({ selected }) => selected);

    if (!selected) {
      selected = accounts[0];
    }

    return selected;
  }, [accounts]);
}
